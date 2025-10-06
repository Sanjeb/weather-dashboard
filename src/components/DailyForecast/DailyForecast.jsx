import React from 'react';
import * as IoIcons from 'react-icons/io5';
import './DailyForecast.css';

const DailyForecast = ({ data }) => {
  return (
    <div className="daily-forecast">
      <h3>7-Day Forecast</h3>
      <div className="forecast-cards">
        {data.map((day, index) => {
          const WeatherIcon = IoIcons[day.icon];
          return (
            <div key={index} className="forecast-card">
              <div className="day">{day.day}</div>
              {WeatherIcon && <WeatherIcon size={30} />}
              <div className="temps">
                <span className="high">{day.high}°</span>
                <span className="low">{day.low}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyForecast;
