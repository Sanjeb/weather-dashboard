import React from 'react';
import * as IoIcons from 'react-icons/io5';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import './HourlyForecast.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

const HourlyForecast = ({ data }) => {
  const chartData = {
    labels: data.map(hour => hour.time),
    datasets: [
      {
        fill: true,
        label: 'Temperature',
        data: data.map(hour => hour.temperature),
        borderColor: '#4facfe',
        backgroundColor: 'rgba(79, 172, 254, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Hourly Temperature Forecast',
        color: '#fff',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        titleColor: '#4facfe',
        bodyColor: '#fff',
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#fff',
          callback: function(value) {
            return value + '°C';
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#fff',
        }
      }
    }
  };

  return (
    <div className="hourly-forecast">
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
      <div className="hourly-details">
        <h3>Detailed Hourly Forecast</h3>
        <div className="hourly-grid">
          {data.map((hour, index) => {
            const WeatherIcon = IoIcons[hour.icon];
            return (
              <div key={index} className="hourly-item">
                <div className="hour">{hour.time}</div>
                {WeatherIcon && <WeatherIcon size={24} />}
                <div className="temp">{hour.temperature}°C</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast;
