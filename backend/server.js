const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
