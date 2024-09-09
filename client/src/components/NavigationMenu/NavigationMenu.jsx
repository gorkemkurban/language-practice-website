// components/NavigationMenu/NavigationMenu.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import './navigationMenu.css'; // Menü stil dosyanız

const NavigationMenu = () => {
  return (
    <nav className="navigation-menu">
      <ul className="left-menu">
        <li><Link to="/">Home Page</Link></li>
        <li><Link to="/pricing">Pricing</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/chatpage">Chat Page</Link></li>
      </ul>
      <ul className="right-menu">
        <li>
        <Link to="/login-singup"><FaUser className="user-icon" /></Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavigationMenu;
