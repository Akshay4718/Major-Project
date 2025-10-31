import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FaRocket, FaBriefcase, FaChartLine, FaUserGraduate } from 'react-icons/fa';
import image from '../../assets/image.png';

function LandingHeroPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleCreateAccount = () => {
    navigate('/student/signup', email.trim() ? { state: { prefillEmail: email } } : {});
  };

  const handleScrollAbout = () => document.getElementById('about').scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center overflow-hidden pt-20"
        style={{ backgroundImage: `url(${image})` }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/70 to-gray/80" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-20 max-w-6xl mx-auto px-4 py-20">
          {/* Main content */}
          <div className="text-center mb-12 animate-fadeIn">
            
            
            <h1 className="text-white text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6">
              Empower Your Career with <br />
              <span className="text-white">
                CPMS Portal
              </span>
            </h1>
            
            <p className="mt-6 text-gray-200 text-xl sm:text-2xl font-light max-w-3xl mx-auto">
              Discover opportunities, track progress, and connect with your TPO — all in one intelligent platform.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="px-6 py-4 w-full sm:w-96 rounded-xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 text-gray-900 bg-white/95 backdrop-blur-sm"
                />
                <button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 px-8 py-4 rounded-xl text-white font-bold shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transform"
                  onClick={handleCreateAccount}
                >
                  Get Started →
                </button>
              </div>
            </div>

            
          </div>

          {/* Feature highlights */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-5xl mx-auto">
            {[
              { icon: <FaUserGraduate />, title: "5000+", subtitle: "Students" },
              { icon: <FaBriefcase />, title: "500+", subtitle: "Companies" },
              { icon: <FaChartLine />, title: "85%", subtitle: "Placement Rate" },
              { icon: <FaRocket />, title: "24/7", subtitle: "Support" },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105 transform">
                <div className="text-4xl text-blue-400 mb-3 flex justify-center">{stat.icon}</div>
                <h3 className="text-3xl font-bold text-white mb-1">{stat.title}</h3>
                <p className="text-gray-300 text-sm">{stat.subtitle}</p>
              </div>
            ))}
          </div> */}

          {/* Scroll indicator */}
          <div className="mt-16 flex flex-col items-center">
            <p
              className="text-gray-300 hover:text-white cursor-pointer transition-all duration-300 flex items-center gap-2 group"
              onClick={handleScrollAbout}
            >
              <span>Learn more about CPMS</span>
              <span className="group-hover:translate-y-1 transition-transform">↓</span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default LandingHeroPage;

