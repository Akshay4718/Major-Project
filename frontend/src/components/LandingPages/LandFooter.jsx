import { useNavigate } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaGithub, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import Logo from '../../assets/CPMS.png';

function LandFooter() {
  const navigate = useNavigate();
  
  const loginLinks = [
    { label: 'Student Login', path: '/student/login' },
    { label: 'TPO Login', path: '/tpo/login' },
    { label: 'Management Login', path: '/management/login' },
    { label: 'Admin Login', path: '/admin' },
  ];

  const quickLinks = [
    { label: 'About Us', path: '#about' },
    { label: 'Features', path: '#features' },
    { label: 'Contact', path: '#contact' },
    { label: 'Privacy Policy', path: '#privacy' },
  ];

  const socialLinks = [
    { icon: <FaFacebook />, href: '#', label: 'Facebook' },
    { icon: <FaTwitter />, href: '#', label: 'Twitter' },
    { icon: <FaLinkedin />, href: '#', label: 'LinkedIn' },
    { icon: <FaInstagram />, href: '#', label: 'Instagram' },
    { icon: <FaGithub />, href: '#', label: 'GitHub' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={Logo} alt="CPMS Logo" className="w-12 h-12 rounded-lg" />
              <h3 className="text-2xl font-bold">CPMS</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Revolutionizing campus placement management with intelligent, efficient, and user-friendly solutions.
            </p>
            <div className="flex gap-3 mt-4">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  className="bg-gray-700 hover:bg-blue-600 p-3 rounded-full transition-all duration-300 hover:scale-110 transform"
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-blue-400">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.path}
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Login Portals */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-blue-400">Login Portals</h4>
            <ul className="space-y-3">
              {loginLinks.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-blue-400">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-blue-400 mt-1 flex-shrink-0" />
                <span>The National Institute of Engineering, Mysuru, Karnataka</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-blue-400 flex-shrink-0" />
                <a href="mailto:cpms@nie.ac.in" className="hover:text-white transition-colors">
                  cpms@nie.ac.in
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-blue-400 flex-shrink-0" />
                <a href="tel:+911234567890" className="hover:text-white transition-colors">
                  +91 123 456 7890
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2025 College Placement Management System. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs text-center md:text-right">
              Developed by Final Year Students of NIE Mysuru
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-4">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-xs">
            Developed by Final Year Students of NIE Mysuru | Version 1.0.1
          </p>
        </div>
      </div>
    </footer>
  );
}

export default LandFooter;

