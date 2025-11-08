import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import Navigation from './components/Navigation/Navigation';
import { getInitialWeatherData } from './services/weatherService';
import './App.css';
const Overview = lazy(() => import('./pages/Overview'));
const Details = lazy(() => import('./pages/Details'));

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const CACHE_KEY = 'weather_cache_v1';
    const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS && parsed.data) {
          setWeatherData(parsed.data);
        }
      } catch {}
    }

    getInitialWeatherData()
      .then(data => {
        setWeatherData(data);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
        } catch {}
      })
      .catch(err => console.error('Error fetching weather data:', err));
  }, []);

  if (!weatherData) {
    return <div className="App loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navigation theme={theme} onToggleTheme={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))} />
        <Suspense fallback={<div className="App loading">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Overview weatherData={weatherData} />} />
            <Route path="/details" element={<Details weatherData={weatherData} />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
