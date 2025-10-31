import {useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaCog, FaSignOutAlt } from 'react-icons/fa';
import { IoIosArrowDropdownCircle } from 'react-icons/io';
import axios from 'axios';
import Logo from '../assets/CPMS.png';
import SubMenu from './Submenu';
import { BASE_URL } from '../config/backend_url';

const Sidebar = ({ isSidebarVisible }) => {
  const [sidebar, setSidebar] = useState(isSidebarVisible);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebar(isSidebarVisible);
  }, [isSidebarVisible]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (loadData.role === 'student') navigate('../student/login');
    else if (loadData.role === 'tpo_admin') navigate('../tpo/login');
    else if (loadData.role === 'management_admin') navigate('../management/login');
    else if (loadData.role === 'superuser') navigate('../admin');
  };

  const [loadData, setLoadData] = useState({
    name: 'Not Found',
    email: 'Not Found',
    profile: 'Profile Img',
    role: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${BASE_URL}/user/detail`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        setLoadData({
          name: `${res.data?.first_name} ${res.data?.middle_name} ${res.data?.last_name}`,
          email: res.data.email,
          profile: res.data.profile,
          role: res.data.role,
        });
      })
      .catch(err => {
        if (err.response && err.response.status === 401) {
          const dataToPass = {
            showToastPass: true,
            toastMessagePass: err.response.data.msg,
          };
          navigate('../', { state: dataToPass });
        }
      });
  }, [navigate]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [SidebarData, setSidebarData] = useState([]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  }

  const fetchSidebarData = async () => {
    if (loadData.role === 'superuser') {
      const { SidebarData } = await import('./SuperUser/SidebarData');
      setSidebarData(SidebarData);
    } else if (loadData.role === 'management_admin') {
      const { SidebarData } = await import('./Management/SidebarData');
      setSidebarData(SidebarData);
    } else if (loadData.role === 'tpo_admin') {
      const { SidebarData } = await import('./TPO/SidebarData');
      setSidebarData(SidebarData);
    } else if (loadData.role === 'student') {
      const { SidebarData } = await import('./Students/SidebarData');
      setSidebarData(SidebarData);
    }
  };

  useEffect(() => {
    if (loadData.role) {
      fetchSidebarData();
    }
  }, [loadData.role]);


  return (
    <>
      <nav className={`bg-white w-[260px] min-h-screen h-full z-20 flex flex-col fixed top-0 transition-all duration-300 ${sidebar ? 'translate-x-0' : '-translate-x-full'} shadow-xl border-r border-gray-200 navbar-container`}>
        {/* Main Sidebar Logo and Name */}
        <div className="flex items-center px-5 py-6 gap-3  shadow-md">
          <img className="rounded-xl shadow-lg" src={Logo} alt="Logo Image" width="60" height="60" />
          <div>
            <h1 className="text-2xl font-bold text-white mb-0">
              {loadData.role === 'superuser' && <Link to="/admin/dashboard" className="no-underline text-gray-700 hover:text-indigo-100 transition-colors">CPMS</Link>}
              {loadData.role === 'management_admin' && <Link to="/management/dashboard" className="no-underline text-gray-700 hover:text-indigo-100 transition-colors">CPMS</Link>}
              {loadData.role === 'tpo_admin' && <Link to="/tpo/dashboard" className="no-underline text-gray-700 hover:text-indigo-100 transition-colors">CPMS</Link>}
              {loadData.role === 'student' && <Link to="/student/dashboard" className="no-underline text-gray-700 hover:text-indigo-100 transition-colors">CPMS</Link>}
            </h1>
            
          </div>
        </div>

        {/* Main body */}
        <div className="flex-grow overflow-y-auto sidebar-content pb-24 py-4">
          <div className="flex flex-col justify-center w-full px-2">
            {SidebarData.length > 0 ? (
              SidebarData.map((item, index) => (
                <SubMenu item={item} key={index} currentPath={location.pathname} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-600 mb-2"></i>
                <p className="text-sm text-gray-500">Loading menu...</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Menu */}
        <div className="bottom-0 absolute w-full transition-all duration-300 border-t border-gray-200 bg-white">
          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className={`w-full bg-gradient-to-b from-gray-50 to-white shadow-inner transition-all duration-300 ${dropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-5'}`}>
              {/* Conditional rendering based on role */}
              {loadData.role === 'student' && (
                <Link to={`../student/account`} className="flex items-center no-underline text-gray-700 px-4 py-3 hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
                  <FaCog className="mr-3 text-gray-500 group-hover:text-indigo-600 transition-colors" /> 
                  <span className="font-medium text-sm">Account Settings</span>
                </Link>
              )}
              {loadData.role === 'tpo_admin' && (
                <Link to={`../tpo/account`} className="flex items-center no-underline text-gray-700 px-4 py-3 hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
                  <FaCog className="mr-3 text-gray-500 group-hover:text-indigo-600 transition-colors" /> 
                  <span className="font-medium text-sm">Account Settings</span>
                </Link>
              )}
              {loadData.role === 'management_admin' && (
                <Link to={`../management/account`} className="flex items-center no-underline text-gray-700 px-4 py-3 hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
                  <FaCog className="mr-3 text-gray-500 group-hover:text-indigo-600 transition-colors" /> 
                  <span className="font-medium text-sm">Account Settings</span>
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-all border-t border-gray-200 group">
                <FaSignOutAlt className="mr-3 group-hover:translate-x-1 transition-transform" /> 
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
          )}

          {/* User Profile */}
          <div className="flex justify-between items-center cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 px-3 py-3 group" onClick={toggleDropdown}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative">
                <img src={loadData.profile} alt="Profile" className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-200 group-hover:ring-indigo-400 transition-all shadow-md" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">{loadData.name}</h2>
                <p className="text-xs text-gray-500 truncate">{loadData.email}</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <IoIosArrowDropdownCircle size={20} className={`text-gray-400 group-hover:text-indigo-600 transition-all duration-300 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;

