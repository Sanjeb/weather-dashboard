import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navigation from './components/Navigation/Navigation';
import Overview from './pages/Overview';
import Details from './pages/Details';
import './App.css';

function App() {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch from your backend
    fetch('http://localhost:5000/api/weather')
      .then(res => res.json())
      .then(data => setWeatherData(data))
      .catch(err => console.error('Error fetching weather data:', err));
  }, []);

  if (!weatherData) {
    return <div className="App loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Overview weatherData={weatherData} />} />
          <Route path="/details" element={<Details weatherData={weatherData} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
