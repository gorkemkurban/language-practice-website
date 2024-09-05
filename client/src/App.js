// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import LanguageSelection from './components/LanguageSelection/LanguageSelection';
import CharacterSelection from './components/CharacterSelection/CharacterSelection';
import Chatbot from './components/ChatPage/ChatPage';
import NavigationMenu from './components/NavigationMenu/NavigationMenu'; 
import LoginSignupPage from './components/LoginSignupPage/LoginSignupPage';
import Pricing from './components/Pricing/Pricing';
import About from './components/About/About';

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavMenu = location.pathname === '/chatpage';

  return (
    <div className="app-container">
      {!hideNavMenu && <NavigationMenu />}
      {children}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/language-selection" element={<Layout><LanguageSelection /></Layout>} />
        <Route path="/character-selection" element={<Layout><CharacterSelection /></Layout>} />
        <Route path="/chatpage" element={<Layout><Chatbot /></Layout>} />
        <Route path='/login-singup' element={<Layout><LoginSignupPage /></Layout>} />
        <Route path='/pricing' element={<Layout><Pricing /></Layout>} />
        <Route path='/about' element={<Layout><About /></Layout>} />
      </Routes>
    </Router>
  );
};

export default App;
