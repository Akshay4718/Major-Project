import {useEffect, useState } from "react";
import Logo from '../../assets/CPMS.png';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

function LandingNavbar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [buttonSize, setButtonSize] = useState('lg');
  const [logoText, setLogoText] = useState('College Placement Management System');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 600) setButtonSize('sm'), setLogoText('CPMS');
      else if (width <= 768) setButtonSize('md'), setLogoText('College Placement Management System');
      else setButtonSize('lg'), setLogoText('College Placement Management System');
    };

    handleResize();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <header className={`w-full z-50 fixed top-0 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-xl' : 'bg-white/90 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform duration-300" onClick={() => navigate('/')}>
          <img src={Logo} alt="CPMS Logo" className="rounded-xl w-12 h-12 md:w-16 md:h-16 shadow-lg" />
          <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {logoText}
          </h1>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 md:gap-3 items-center">
          <button
            className="px-4 md:px-6 py-2 md:py-2.5 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-105 transform shadow-sm"
            onClick={() => navigate('/student/login')}
          >
            Login
          </button>
          <button
            className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 transform shadow-lg"
            onClick={() => navigate('/student/signup')}
          >
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
}

export default LandingNavbar;

