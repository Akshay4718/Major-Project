import {useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from "../../assets/CPMS.png";
import Toast from '../../components/Toast';
import isAuthenticated from '../../utility/auth.utility';
import { BASE_URL } from '../../config/backend_url';

function Signup() {
  document.title = 'CPMS | Student Sign Up';
  const navigate = useNavigate();
  const location = useLocation();

  const prefillEmail = location?.state?.prefillEmail || '';

  useEffect(() => {
    if (isAuthenticated()) navigate("../student/dashboard");
  }, [navigate]);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState({});

  const [formData, setFormData] = useState({
    first_name: '',
    email: prefillEmail,
    number: '',
    password: '',
  });

  const { first_name, number, email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === 'password' && e.target.value && !validatePassword(e.target.value)) {
      setError({ ...error, password: 'Password must be 8+ chars, include uppercase, lowercase, number & special char' });
    } else {
      setError({ ...error, [e.target.name]: '' });
    }
  };

  function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!first_name) newErrors.first_name = 'Name Required!';
    if (!email) newErrors.email = 'Email Required!';
    if (!number) newErrors.number = 'Number Required!';
    if (!password) newErrors.password = 'Password Required!';
    if (number && number.length !== 10) newErrors.number = 'Number must be 10 digits!';
    if (password && !validatePassword(password)) newErrors.password = 'Password must be 8+ chars, include uppercase, lowercase, number & special char';
    if (Object.keys(newErrors).length) return setError(newErrors);

    try {
      await axios.post(`${BASE_URL}/student/signup`, formData);
      navigate('../student/login', {
        state: { showToastPass: true, toastMessagePass: "User Created Successfully! Now You Can Login." }
      });
    } catch (err) {
      setToastMessage(err?.response?.data?.msg || 'Something went wrong');
      setShowToast(true);
    }
  };

  const [isEyeOpen, setEyeOpen] = useState(false);

  return (
    <>
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
        position="bottom-end"
      />

      <div className="flex justify-center items-center min-h-screen bg-gray-50 py-6">
        <form
          className="flex flex-col gap-4 bg-white p-8 rounded-lg shadow-md w-96 max-sm:w-11/12"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col items-center">
            <img src={Logo} alt="Logo" className="w-24 h-24 mb-4 rounded-lg" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Sign Up as a Student</h1>
          </div>

          {/* Name */}
          <div>
            <input
              type="text"
              name="first_name"
              value={first_name}
              onChange={handleChange}
              placeholder="Name"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            {error.first_name && <p className="text-red-500 text-sm mt-1">{error.first_name}</p>}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            {error.email && <p className="text-red-500 text-sm mt-1">{error.email}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <input
              type="number"
              name="number"
              value={number}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              onInput={(e) => e.target.value = e.target.value.slice(0, 10)}
            />
            {error.number && <p className="text-red-500 text-sm mt-1">{error.number}</p>}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={isEyeOpen ? "text" : "password"}
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <i
              className={`absolute right-3 top-3 cursor-pointer ${isEyeOpen ? "fa-solid fa-eye" : "fa-regular fa-eye-slash"}`}
              onClick={() => setEyeOpen(!isEyeOpen)}
            ></i>
            {error.password && <p className="text-red-500 text-sm mt-1">{error.password}</p>}
          </div>

          <button type="submit" className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 transition">
            Sign Up
          </button>

          <p className="text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <span className="text-blue-500 cursor-pointer" onClick={() => navigate('../student/login')}>
              Login
            </span>
          </p>

          <p className="text-center text-gray-400 text-xs mt-2">© College Placement Management System 2025 - 26</p>
        </form>
      </div>
    </>
  );
}

export default Signup;

