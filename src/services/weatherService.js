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

// Cache management
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCache(key) {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const entry = JSON.parse(cached);
    if (Date.now() > entry.expires) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}

function setCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify({
      value,
      expires: Date.now() + CACHE_TTL_MS
    }));
  } catch (e) {
    console.warn('Failed to cache data:', e);
  }
}

// Weather code mapping functions
function mapWeatherCodeToIcon(code) {
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

// Get initial weather data (mock data)
export function getInitialWeatherData() {
  return Promise.resolve(mockWeatherData);
}

// Search for weather by city name
export async function searchWeatherByCity(cityName) {
  const name = (cityName || '').toString().trim();
  if (!name) {
    throw new Error('City name is required');
  }
  if (name.length > 64) {
    throw new Error('City name too long');
  }

  const cacheKey = `weather_city_${name.toLowerCase()}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Geocoding first pass: restrict to India
    let geoUrlIn = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5&language=en&format=json&country=IN`;
    let geoResp = await fetch(geoUrlIn);
    
    if (!geoResp.ok) {
      throw new Error(`Geocoding service error: ${geoResp.status}`);
    }

    let geo = await geoResp.json();
    let place = geo && geo.results && geo.results.length > 0 
      ? geo.results.find(r => r.country_code === 'IN') 
      : null;

    // Fallback: try global search, then filter to India
    if (!place) {
      const geoUrlAll = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=10&language=en&format=json`;
      geoResp = await fetch(geoUrlAll);
      
      if (!geoResp.ok) {
        throw new Error(`Geocoding service error: ${geoResp.status}`);
      }
      
      geo = await geoResp.json();
      if (geo && geo.results && geo.results.length > 0) {
        place = geo.results.find(r => r.country_code === 'IN');
      }
    }

    if (!place) {
      throw new Error('City not found in India');
    }

    const { latitude, longitude } = place;
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    
    const fcResp = await fetch(forecastUrl);
    if (!fcResp.ok) {
      throw new Error(`Forecast service error: ${fcResp.status}`);
    }

    const fc = await fcResp.json();

    const code = Array.isArray(fc.daily?.weather_code) ? fc.daily.weather_code[0] : (fc.current?.weather_code || 2);
    const icon = mapWeatherCodeToIcon(code);
    const description = mapWeatherCodeToText(code);

    const hourly = (fc.hourly?.time || []).slice(0, 24).map((t, i) => ({
      time: new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
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
    return payload;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch weather data');
  }
}

// Search cities in mock data
export function searchCitiesInMockData(query) {
  const q = (query || '').toString().trim().toLowerCase();
  if (!q) {
    return { cities: mockWeatherData.cities };
  }
  const result = mockWeatherData.cities.filter(c => 
    c.city.toLowerCase().includes(q)
  );
  return { cities: result };
}

