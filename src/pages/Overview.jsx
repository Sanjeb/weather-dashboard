import React, { useMemo, useState, useEffect } from 'react';
import WeatherCard from '../components/WeatherCard/WeatherCard';
import { searchWeatherByCity, searchCitiesInMockData } from '../services/weatherService';
import './Overview.css';

const Overview = ({ weatherData }) => {
  const [query, setQuery] = useState('');
  const [debouncedRaw, setDebouncedRaw] = useState('');
  const [debouncedLower, setDebouncedLower] = useState('');
  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => {
      const raw = query.trim();
      setDebouncedRaw(raw);
      setDebouncedLower(raw.toLowerCase());
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (debouncedRaw.length < 2) {
      setRemote(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    
    // First try to search in mock data
    const mockResults = searchCitiesInMockData(debouncedRaw);
    if (mockResults.cities.length > 0) {
      setRemote(mockResults);
      setError(null);
      setLoading(false);
      return;
    }

    // If not found in mock data, search via API
    searchWeatherByCity(debouncedRaw)
      .then(data => {
        if (!cancelled) {
          setRemote(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setRemote({ cities: [] });
          setError(err.message || 'City not found');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [debouncedRaw]);

  const filtered = useMemo(() => {
    if (remote && Array.isArray(remote.cities)) return remote.cities;
    if (!debouncedLower) return weatherData.cities;
    return weatherData.cities.filter(c => c.city.toLowerCase().includes(debouncedLower));
  }, [debouncedLower, weatherData.cities, remote]);

  return (
    <div className="overview-page">
      <div className="overview-toolbar">
        <input
          type="search"
          className="city-search"
          placeholder="Search city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search city"
        />
      </div>
      <div className="cards-grid">
        {loading && debouncedRaw.length >= 2 && (
          <div className="no-results">Searching for {debouncedRaw}...</div>
        )}
        {!loading && error && debouncedRaw.length >= 2 && (
          <div className="no-results error-message">{error}</div>
        )}
        {!loading && !error && filtered.map(city => (
          <WeatherCard
            key={city.id}
            data={{
              ...city.current,
              city: city.city
            }}
          />
        ))}
        {!loading && !error && filtered.length === 0 && debouncedRaw.length >= 2 && (
          <div className="no-results">No cities found</div>
        )}
        {!loading && !error && filtered.length === 0 && debouncedRaw.length < 2 && (
          <div className="no-results">Type at least 2 characters to search</div>
        )}
      </div>
    </div>
  );
};

export default Overview;
