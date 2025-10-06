import React from 'react';
import * as IoIcons from 'react-icons/io5';
import { IoLocationSharp, IoTimeOutline } from 'react-icons/io5';
import './WeatherCard.css';

const WeatherCard = ({ data }) => {
  // Dynamically get the icon component from the string name
  const WeatherIcon = IoIcons[data.icon];
  
  // Get current time
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="weather-card">
      <div className="location-info">
        <IoLocationSharp size={20} />
        <h2>{data.city}</h2>
      </div>
      <div className="time-info">
        <IoTimeOutline size={16} />
        <span>{currentTime}</span>
        <span className="date">{currentDate}</span>
      </div>
      <div className="temperature">{data.temperature}°C</div>
      {WeatherIcon && <WeatherIcon size={50} />}
      <div className="description">{data.description}</div>
      <div className="high-low">
        <span className="high">H: {data.high}°C</span>
        <span className="low">L: {data.low}°C</span>
      </div>
    </div>
  );
};

export default WeatherCard;
