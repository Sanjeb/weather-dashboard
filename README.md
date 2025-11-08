# Weather Dashboard

A modern weather dashboard application built with React and Express.js that displays weather information for cities in India.

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

3. **Configure environment variables** (optional):
   
   Create a `.env` file in the root directory if you want to customize the configuration:
   ```env
   PORT=5000
   ALLOWED_ORIGINS=http://localhost:3000
   REACT_APP_API_URL=http://localhost:5000
   ```
   
   Note: The application will work with default values if no `.env` file is provided.

## Running the Project

The project consists of two parts: a backend server and a frontend React application.

### Option 1: Run Both Services (Recommended)

**Terminal 1 - Start the backend server:**
```bash
node backend/server.js
```

The backend server will start on `http://localhost:5000` (or the port specified in your `.env` file).

**Terminal 2 - Start the frontend application:**
```bash
npm start
```

The React app will start on `http://localhost:3000` and automatically open in your browser.

### Option 2: Run Backend in Background

**Start the backend server in the background:**
```bash
node backend/server.js &
```

**Start the frontend:**
```bash
npm start
```

## Accessing the Application

Once both servers are running, open your browser and navigate to:
```
http://localhost:3000
```

## Building for Production

To create a production build of the frontend:

```bash
npm run build
```

This will create an optimized build in the `build/` directory.

## Project Structure

```
weather-dashboard/
├── backend/
│   └── server.js          # Express backend server
├── public/                # Static assets
├── src/                   # React application source
│   ├── components/       # Reusable React components
│   ├── pages/            # Page components
│   └── data/             # Data utilities
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Features

- Real-time weather data for Indian cities
- Hourly and daily weather forecasts
- Modern, responsive UI with dark/light theme support
- Weather data caching for improved performance

## Troubleshooting

- **Port already in use**: If port 5000 or 3000 is already in use, either stop the conflicting service or change the port in your `.env` file.
- **CORS errors**: Make sure the `ALLOWED_ORIGINS` in your backend `.env` matches your frontend URL.
- **API errors**: Ensure you have an active internet connection as the backend fetches weather data from external APIs.

