// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import HomePage from './Pages/HomePage/HomePage';
import LanguageSelection from './Pages/LanguageSelection/LanguageSelection';
import CharacterSelection from './Pages/CharacterSelection/CharacterSelection';
import Chatbot from './Pages/ChatPage/ChatPage';
import NavigationMenu from './components/NavigationMenu/NavigationMenu'; 
import LoginSignupPage from './Pages/LoginSignupPage/LoginSignupPage';
import Pricing from './Pages/Pricing/Pricing';
import About from './Pages/About/About';
import Learn from './Pages/Learn/Learn';

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
        <Route path='/learn' element={<Layout><Learn /></Layout>} />
      </Routes>
    </Router>
  );
};

export default App;
