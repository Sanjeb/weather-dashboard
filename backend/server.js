const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: false
}));
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(express.json({ limit: '100kb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Mock weather data for multiple cities
const mockWeatherData = {
  cities: [
    {
      id: 1,
      city: "Chennai",
      current: {
        temperature: 31,
        description: "Partly Cloudy",
        high: 33,
        low: 28,
        icon: "IoPartlySunny"
      },
      hourly: Array.from({ length: 24 }, (_, i) => ({
        time: `${i === 0 ? '12' : i > 12 ? i - 12 : i}:00 ${i >= 12 ? 'PM' : 'AM'}`,
        temperature: Math.floor(28 + Math.random() * 5),
        icon: i >= 6 && i <= 18 ? "IoPartlySunny" : "IoMoon",
        humidity: Math.floor(60 + Math.random() * 20),
        windSpeed: Math.floor(5 + Math.random() * 10)
      })),
      daily: Array.from({ length: 7 }, (_, i) => ({
        day: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        high: Math.floor(30 + Math.random() * 4),
        low: Math.floor(26 + Math.random() * 4),
        icon: "IoPartlySunny"
      }))
    },
    {
      id: 2,
      city: "Mumbai",
      current: {
        temperature: 29,
        description: "Rainy",
        high: 31,
        low: 26,
        icon: "IoRainy"
      },
      hourly: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        temperature: Math.floor(26 + Math.random() * 5),
        icon: "IoRainy"
      })),
      daily: Array.from({ length: 7 }, (_, i) => ({
        day: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        high: Math.floor(29 + Math.random() * 4),
        low: Math.floor(25 + Math.random() * 4),
        icon: "IoRainy"
      }))
    }
  ]
};

// Routes
app.get('/api/weather', (req, res) => {
  res.json(mockWeatherData);
});

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function setCache(key, value) {
  cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function mapWeatherCodeToIcon(code) {
  // Basic mapping for demo purposes
  if (code === 0) return 'IoSunny'; // Clear
  if ([1, 2, 3].includes(code)) return 'IoPartlySunny'; // Mainly clear to overcast
  if ([45, 48].includes(code)) return 'IoCloudy'; // Fog
  if ([51, 53, 55, 56, 57].includes(code)) return 'IoRainy'; // Drizzle
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'IoRainy'; // Rain
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'IoSnow'; // Snow
  if ([95, 96, 99].includes(code)) return 'IoThunderstorm'; // Thunderstorm
  return 'IoPartlySunny';
}

function mapWeatherCodeToText(code) {
  const map = {
    0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    56: 'Freezing drizzle', 57: 'Freezing drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    66: 'Freezing rain', 67: 'Freezing rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    77: 'Snow grains', 80: 'Rain showers', 81: 'Rain showers', 82: 'Violent rain showers',
    85: 'Snow showers', 86: 'Snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm'
  };
  return map[code] || 'Cloudy';
}

app.get('/api/weather/city', async (req, res) => {
  try {
    const name = (req.query.name || '').toString().trim();
    if (!name) return res.status(400).json({ message: 'Missing name query parameter' });
    if (name.length > 64) return res.status(400).json({ message: 'Query too long' });

    const cacheKey = `city_${name.toLowerCase()}`;
    const cached = getCache(cacheKey);
    if (cached) {
      console.log(`Cache hit for: ${name}`);
      return res.json(cached);
    }

    console.log(`Searching for city: ${name}`);

    // Geocoding first pass: restrict to India
    const geoUrlIn = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5&language=en&format=json&country=IN`;
    let geoResp;
    try {
      geoResp = await fetch(geoUrlIn);
      if (!geoResp.ok) {
        console.error(`Geocoding API error (India): ${geoResp.status}`);
        throw new Error(`Geocoding service error: ${geoResp.status}`);
      }
    } catch (err) {
      console.error('Fetch error (India search):', err.message);
      return res.status(502).json({ message: 'Geocoding service unavailable' });
    }

    let geo = await geoResp.json();
    let place = geo && geo.results && geo.results.length > 0 ? geo.results.find(r => r.country_code === 'IN') : null;

    // Fallback: try global search, then filter to India
    if (!place) {
      console.log(`India-specific search failed, trying global search for: ${name}`);
      const geoUrlAll = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=10&language=en&format=json`;
      try {
        geoResp = await fetch(geoUrlAll);
        if (!geoResp.ok) {
          console.error(`Geocoding API error (Global): ${geoResp.status}`);
          throw new Error(`Geocoding service error: ${geoResp.status}`);
        }
      } catch (err) {
        console.error('Fetch error (Global search):', err.message);
        return res.status(502).json({ message: 'Geocoding service unavailable' });
      }
      geo = await geoResp.json();
      if (geo && geo.results && geo.results.length > 0) {
        place = geo.results.find(r => r.country_code === 'IN');
        if (!place && geo.results.length > 0) {
          console.log(`Found ${geo.results.length} results, but none in India. First result:`, geo.results[0].name, geo.results[0].country_code);
        }
      }
    }

    if (!place) {
      console.log(`City not found in India: ${name}`);
      return res.status(404).json({ message: 'City not found in India' });
    }

    console.log(`Found city: ${place.name}, ${place.country_code}, lat: ${place.latitude}, lon: ${place.longitude}`);

    const { latitude, longitude } = place;
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    
    let fcResp;
    try {
      fcResp = await fetch(forecastUrl);
      if (!fcResp.ok) {
        console.error(`Forecast API error: ${fcResp.status}`);
        return res.status(502).json({ message: 'Forecast service error' });
      }
    } catch (err) {
      console.error('Fetch error (Forecast):', err.message);
      return res.status(502).json({ message: 'Forecast service unavailable' });
    }

    const fc = await fcResp.json();

    const code = Array.isArray(fc.daily?.weather_code) ? fc.daily.weather_code[0] : (fc.current?.weather_code || 2);
    const icon = mapWeatherCodeToIcon(code);
    const description = mapWeatherCodeToText(code);

    const hourly = (fc.hourly?.time || []).slice(0, 24).map((t, i) => ({
      time: new Date(t).toLocaleTimeString('en-US', { hour: '2-digit' }),
      temperature: Math.round(fc.hourly.temperature_2m[i] || 0),
      icon: mapWeatherCodeToIcon(fc.hourly.weather_code?.[i] || 2),
      humidity: Math.round(fc.hourly.relative_humidity_2m?.[i] || 0),
      windSpeed: Math.round(fc.hourly.wind_speed_10m?.[i] || 0)
    }));

    const daily = (fc.daily?.time || []).slice(0, 7).map((d, i) => ({
      day: new Date(d).toLocaleDateString('en-US', { weekday: 'short' }),
      high: Math.round(fc.daily.temperature_2m_max[i] || 0),
      low: Math.round(fc.daily.temperature_2m_min[i] || 0),
      icon: mapWeatherCodeToIcon(fc.daily.weather_code?.[i] || 2)
    }));

    const cityPayload = {
      id: `${place.id || `${latitude},${longitude}`}`,
      city: `${place.name}${place.admin1 ? ', ' + place.admin1 : ''}`,
      current: {
        temperature: Math.round(fc.current?.temperature_2m || daily[0]?.high || 0),
        description,
        high: daily[0]?.high || 0,
        low: daily[0]?.low || 0,
        icon
      },
      hourly,
      daily
    };

    const payload = { cities: [cityPayload] };
    setCache(cacheKey, payload);
    console.log(`Successfully fetched weather for: ${cityPayload.city}`);
    res.json(payload);
  } catch (e) {
    console.error('Unexpected error in /api/weather/city:', e);
    res.status(500).json({ message: 'Unexpected server error', error: e.message });
  }
});

// Query by city name (case-insensitive, basic validation)
app.get('/api/weather/search', (req, res) => {
  const q = (req.query.city || '').toString().trim();
  if (!q) {
    return res.status(400).json({ message: 'Missing city query parameter' });
  }
  if (q.length > 64) {
    return res.status(400).json({ message: 'Query too long' });
  }
  const result = mockWeatherData.cities.filter(c => c.city.toLowerCase().includes(q.toLowerCase()));
  res.json({ cities: result });
});

app.get('/api/weather/:cityId', (req, res) => {
  const city = mockWeatherData.cities.find(c => c.id === parseInt(req.params.cityId));
  if (city) {
    res.json(city);
  } else {
    res.status(404).json({ message: 'City not found' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
