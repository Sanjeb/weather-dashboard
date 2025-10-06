import React from 'react';
import WeatherCard from '../components/WeatherCard/WeatherCard';
import './Overview.css';

const Overview = ({ weatherData }) => {
  return (
    <div className="overview-page">
      <div className="cards-grid">
        {weatherData.cities.map(city => (
          <WeatherCard 
            key={city.id} 
            data={{
              ...city.current,
              city: city.city  // Ensure city name is passed to the WeatherCard
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Overview;
