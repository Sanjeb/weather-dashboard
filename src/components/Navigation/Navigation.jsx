import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ theme = 'dark', onToggleTheme }) => {
  const location = useLocation();
  
  return (
    <nav className="navigation">
      <div className="nav-brand">Weather Dashboard</div>
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Overview
        </Link>
        <Link to="/details" className={location.pathname === '/details' ? 'active' : ''}>
          Details
        </Link>
        <button
          type="button"
          aria-label="Toggle color theme"
          className="theme-toggle"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
