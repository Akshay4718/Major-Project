import {useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Logo from '../../assets/CPMS.png';
import Toast from '../../components/Toast';
import isAuthenticated from '../../utility/auth.utility';
import { Button } from 'react-bootstrap';
import { BASE_URL } from '../../config/backend_url';

function Login() {
  document.title = 'CPMS | Student Login';
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { email, password } = formData;
  const [isEyeOpen, setEyeOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) navigate("../student/dashboard");
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'email') setError({ ...error, email: '' });
    if (e.target.name === 'password') setError({ ...error, password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email && !password) return setError({ email: 'Email Required!', password: 'Password Required!' });
    if (!email) return setError({ email: 'Email Required!' });
    if (!password) return setError({ password: 'Password Required!' });

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/student/login`, formData);
      localStorage.setItem('token', response.data.token);
      
      // Check if profile is completed
      const user = response.data.user;
      if (user && (user.isProfileCompleted === false || user.isProfileCompleted === 'false')) {
        // Redirect to complete profile page
        navigate(`../student/complete-profile/${user.id}`);
      } else {
        // Profile is complete, go to dashboard
        navigate('../student/dashboard');
      }
    } catch (error) {
      if (error?.response?.data?.msg) {
        setToastMessage(error.response.data.msg);
        setShowToast(true);
      }
      console.log("Error in Student login.jsx => ", error);
      setLoading(false);
    }
  };

  // Show toast if redirected from signup
  const { showToastPass, toastMessagePass } = location.state || { showToastPass: false, toastMessagePass: '' };
  useEffect(() => {
    if (showToastPass) {
      setToastMessage(toastMessagePass);
      setShowToast(showToastPass);
      navigate('.', { replace: true, state: {} });
    }
  }, []);

  const handleEye = () => setEyeOpen(!isEyeOpen);

  return (
    <>
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
        position="bottom-end"
      />

      <div className="flex justify-center items-center h-screen bg-gray-100">
        <form
          className="flex flex-col items-center gap-5 bg-white border border-gray-300 rounded-lg p-8 shadow-md w-96 max-w-[90%]"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col items-center gap-3">
            <img src={Logo} alt="CPMS Logo" className="w-32 h-32 rounded-lg shadow-sm" />
            <h1 className="text-2xl font-semibold text-gray-800">Please Log In</h1>
          </div>

          <div className="w-full flex flex-col gap-1">
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 outline-none"
              autoComplete="email"
            />
            {error.email && <span className="text-red-500 text-sm ml-1">{error.email}</span>}
          </div>

          <div className="w-full flex flex-col gap-1 relative">
            <input
              type={isEyeOpen ? "text" : "password"}
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 outline-none"
              autoComplete="current-password"
            />
            <i
              className={`absolute right-3 top-2.5 cursor-pointer text-gray-500 ${isEyeOpen ? "fa-solid fa-eye" : "fa-regular fa-eye-slash"}`}
              onClick={handleEye}
            ></i>
            {error.password && <span className="text-red-500 text-sm ml-1">{error.password}</span>}
          </div>

          <Button type="submit" variant="primary" className="w-full py-2" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Log In'}
          </Button>

          <p className="text-sm text-gray-700 text-center">
            Don't have an account?{' '}
            <span
              className="text-blue-500 font-medium cursor-pointer hover:underline"
              onClick={() => navigate('../student/signup')}
            >
              Create new account
            </span>
          </p>

          <p className="text-xs text-gray-400 text-center mt-4">© College Placement Management System 2025 - 26</p>
        </form>
      </div>
    </>
  );
}

export default Login;

