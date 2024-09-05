import React from 'react';
import './loginSignupPage.css';

const LoginSingupPage = () => {
  return (
    <div className="login-signup-wrapper">
      <div className="login-signup-container">
        <div className="login-section">
          <h2>Login</h2>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input type="email" id="login-email" placeholder="Email" />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input type="password" id="login-password" placeholder="Password" />
          </div>
          <button>Login</button>
        </div>
        <div className="signup-section">
          <h2>Sign Up</h2>
          <div className="form-group">
            <label htmlFor="signup-first-name">First Name</label>
            <input type="text" id="signup-first-name" placeholder="First Name" />
          </div>
          <div className="form-group">
            <label htmlFor="signup-last-name">Last Name</label>
            <input type="text" id="signup-last-name" placeholder="Last Name" />
          </div>
          <div className="form-group">
            <label htmlFor="signup-email">Email</label>
            <input type="email" id="signup-email" placeholder="Email" />
          </div>
          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input type="password" id="signup-password" placeholder="Password" />
          </div>
          <button>Sign Up</button>
        </div>
      </div>
    </div>
  );
};

export default LoginSingupPage;
