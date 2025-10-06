import React, { useState } from 'react';
import WeatherCard from '../components/WeatherCard/WeatherCard';
import DailyForecast from '../components/DailyForecast/DailyForecast';
import HourlyForecast from '../components/HourlyForecast/HourlyForecast';
import './Details.css';

const Details = ({ weatherData }) => {
  const [selectedCity, setSelectedCity] = useState(weatherData.cities[0]);

  return (
    <div className="details-page">
      <div className="city-selector">
        {weatherData.cities.map(city => (
          <button
            key={city.id}
            className={`city-button ${selectedCity.id === city.id ? 'active' : ''}`}
            onClick={() => setSelectedCity(city)}
          >
            {city.city}
          </button>
        ))}
      </div>
      
      <div className="details-content">
        <WeatherCard data={selectedCity.current} />
        <HourlyForecast data={selectedCity.hourly} />
        <DailyForecast data={selectedCity.daily} />
      </div>
    </div>
  );
};

export default Details;
