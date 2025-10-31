import {useState, useEffect } from "react";
import Badge from 'react-bootstrap/Badge';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config/backend_url';

function NoticeBox() {
  const [loading, setLoading] = useState(true);
  const [noticesData, setNoticesData] = useState([]);
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/user/detail`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser({ role: response.data.role });
      } catch (error) {
        console.log('Error fetching user details => ', error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser?.role) {
      fetchNotices();
    }
  }, [currentUser?.role]);

  const fetchNotices = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/management/get-all-notices`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      let filteredNotices = [];
      if (currentUser?.role === 'management_admin') {
        filteredNotices = response.data.filter((n) => n.sender_role === 'tpo_admin');
      } else if (currentUser?.role === 'tpo_admin') {
        filteredNotices = response.data.filter((n) => n.receiver_role === 'tpo_admin');
      } else if (currentUser?.role === 'student') {
        filteredNotices = response.data.filter((n) => n.receiver_role === 'student');
      }

      setNoticesData(filteredNotices);
    } catch (error) {
      console.log('Error while fetching notices => ', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-2 mx-2 w-full backdrop-blur-md bg-gradient-to-br from-white/40 to-indigo-50/30 border border-indigo-200/50 rounded-xl py-3 px-4 shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-bullhorn text-indigo-600 text-xl animate-pulse"></i>
          <h3 className="font-bold text-gray-800 text-lg">Notice Board</h3>
        </div>
        <div className="flex items-center gap-3">
          {noticesData?.length > 0 && (
            <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {noticesData.length} {noticesData.length === 1 ? 'Notice' : 'Notices'}
            </span>
          )}
          {currentUser?.role === 'student' && (
            <Link to="/student/all-notice" className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition-colors">
              View All →
            </Link>
          )}
          {currentUser?.role === 'tpo_admin' && (
            <Link to="/tpo/all-notice" className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition-colors">
              View All →
            </Link>
          )}
          {currentUser?.role === 'management_admin' && (
            <Link to="/management/all-notice" className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition-colors">
              View All →
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-72 gap-3">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-indigo-600"></i>
          <p className="text-gray-500 text-sm">Loading notices...</p>
        </div>
      ) : (
        <div className="relative h-72 overflow-hidden rounded-lg bg-gradient-to-b from-transparent to-white/50">
          {noticesData?.length > 0 ? (
            <div className="absolute bottom-0 w-full h-full animate-scrollUp">
              {noticesData.map((notice, index) => {
                const isNew =
                  (new Date() - new Date(notice?.createdAt)) / (1000 * 60 * 60 * 24) <= 2;

                return (
                  <Link
                    key={index}
                    to={
                      currentUser?.role === 'student'
                        ? `/student/notice/${notice?._id}`
                        : currentUser?.role === 'tpo_admin'
                        ? `/tpo/notice/${notice?._id}`
                        : currentUser.role === 'management_admin'
                        ? `/management/notice/${notice?._id}`
                        : ''
                    }
                    target="_blank"
                    className="no-underline block mb-3"
                  >
                    <div className="group p-3 bg-white/80 hover:bg-indigo-50 border-l-4 border-indigo-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <i className="fa-solid fa-file-lines text-indigo-600 text-sm"></i>
                            <h4 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors text-sm line-clamp-1">
                              {notice?.title}
                            </h4>
                            {isNew && (
                              <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                NEW
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <i className="fa-regular fa-clock"></i>
                            <span>
                              {new Date(notice?.createdAt).toLocaleDateString('en-IN', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span>
                              {new Date(notice?.createdAt).toLocaleTimeString('en-IN', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                        <i className="fa-solid fa-arrow-right text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"></i>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <i className="fa-solid fa-inbox text-gray-300 text-5xl mb-3"></i>
              <p className="text-gray-500 font-semibold">No Notices Available</p>
              <p className="text-gray-400 text-sm mt-1">Check back later for updates!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NoticeBox;

