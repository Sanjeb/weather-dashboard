# Weather Dashboard

A modern weather dashboard application built with React that displays weather information for cities in India. The application fetches weather data directly from Open-Meteo API in the browser.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd weather-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the Project

Start the React development server:

```bash
npm start
```

The application will start on `http://localhost:3000` and automatically open in your browser.

## Accessing the Application

Once the application starts, it will automatically open in your browser at:
```
http://localhost:3000
```

If it doesn't open automatically, navigate to the URL manually.

## Building for Production

To create a production build:

```bash
npm run build
```

This will create an optimized build in the `build/` directory.

## Project Structure

```
weather-dashboard/
├── public/                # Static assets
├── src/                   # React application source
│   ├── components/       # Reusable React components
│   ├── pages/            # Page components
│   ├── services/         # Weather service utilities
│   └── data/             # Data utilities
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Features

- Real-time weather data for Indian cities
- Hourly and daily weather forecasts
- Modern, responsive UI with dark/light theme support
- Weather data caching for improved performance
- Direct API integration with Open-Meteo weather service
- Mock data for offline/demo purposes

## How It Works

The application uses a weather service (`src/services/weatherService.js`) that:
- Provides mock weather data for initial display (Chennai and Mumbai)
- Fetches real-time weather data from Open-Meteo API when searching for cities
- Implements client-side caching using localStorage to reduce API calls
- Handles geocoding and weather forecast data processing

## Troubleshooting

- **Port already in use**: If port 3000 is already in use, the terminal will prompt you to use a different port. You can also set the `PORT` environment variable.
- **API errors**: Ensure you have an active internet connection as the application fetches weather data from external APIs (Open-Meteo).
- **CORS errors**: The application uses public APIs that support CORS, so this should not be an issue. If you encounter CORS errors, check your browser console for details.
