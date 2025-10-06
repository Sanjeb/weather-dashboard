import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
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
      </div>
    </nav>
  );
};

export default Navigation;
