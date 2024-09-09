import React from 'react';
import './pricing.css';

const NavigationMenu = () => {
  return (
    <div>
      <div className="pricing-header">
        <h2>Pricing</h2>
        <p>Subscribe to keep practicing with AI!</p>
      </div>

      <div className="pricing-container">
        <div className="pricing-card">
          <h3>Basic</h3>
          <p>Free</p>
          <ul>
            <li>Only Type Practice</li>
            <li>20 Minutes</li>
          </ul>
          <button>Subscribe</button>
        </div>

        <div className="pricing-card">
          <h3>Premium</h3>
          <p>2$</p>
          <ul>
            <li>Type Practice</li>
            <li>Talking Practice</li>
            <li>20 Minutes</li>
          </ul>
          <button>Subscribe</button>
        </div>
        
      </div>
    </div>
  );
};

export default NavigationMenu;
