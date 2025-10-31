import {useState, useEffect } from "react";
import Badge from 'react-bootstrap/Badge';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../config/backend_url';

function NotificationBox() {
  const [loading, setLoading] = useState(true);

  const [jobs, setJobs] = useState([]);
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/user/detail`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setCurrentUser({ role: response.data.role });
      } catch (error) {
        console.log("Error fetching user details => ", error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [currentUser?.role]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/tpo/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const currentDate = new Date();
      
      // Filter jobs that haven't reached deadline yet
      const activeJobs = response.data.data.filter(job => {
        // If no deadline set, show the job
        if (!job.applicationDeadline) return true;
        
        // Check if deadline has not passed
        const deadline = new Date(job.applicationDeadline);
        return currentDate <= deadline;
      });
      
      // Sort by posted date and take latest 10
      setJobs(activeJobs.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt)).slice(0, 10));
    } catch (error) {
      console.log('Error while fetching job openings => ', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className="my-2 mx-2 w-full backdrop-blur-md bg-gradient-to-br from-white/40 to-blue-50/30 border border-blue-200/50 rounded-xl py-3 px-4 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-bell text-blue-600 text-xl animate-pulse"></i>
            <h3 className="font-bold text-gray-800 text-lg">Latest Job Openings</h3>
          </div>
          {jobs?.length > 0 && (
            <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {jobs.length} New
            </span>
          )}
          {/* <span className=''>
            {
              currentUser?.role === 'student' && (
                <Link to='/student/all-notice' className='no-underline text-blue-500 hover:text-blue-700'>
                  View All
                </Link>
              )
            }
            {
              currentUser?.role === 'tpo_admin' && (
                <Link to='/tpo/all-notice' className='no-underline text-blue-500 hover:text-blue-700'>
                  View All
                </Link>
              )
            }
            {
              currentUser?.role === 'management_admin' && (
                <Link to='/management/all-notice' className='no-underline text-blue-500 hover:text-blue-700'>
                  View All
                </Link>
              )
            }
          </span> */}
        </div>
        {loading ? (
          <div className="flex flex-col justify-center items-center h-72 gap-3">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-blue-600" />
            <p className="text-gray-500 text-sm">Loading job notifications...</p>
          </div>
        ) : (
          <div className="relative h-72 overflow-hidden rounded-lg bg-gradient-to-b from-transparent to-white/50">
            {jobs?.length > 0 ? (
              <div className="absolute bottom-0 w-full h-full animate-scrollUp">
                {jobs.map((job, index) => (
                  <Link
                    key={index}
                    to={`/student/job/${job?._id}`}
                    target="_blank"
                    className="no-underline block mb-3"
                  >
                    <div className="group p-3 bg-white/80 hover:bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <i className="fa-solid fa-briefcase text-blue-600 text-sm"></i>
                            <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors text-sm">
                              {job?.jobTitle}
                            </h4>
                            {(new Date() - new Date(job?.postedAt)) / (1000 * 60 * 60 * 24) <= 2 && (
                              <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                NEW
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <i className="fa-regular fa-clock"></i>
                            <span>
                              {new Date(job?.postedAt).toLocaleDateString('en-IN', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span>
                              {new Date(job?.postedAt).toLocaleTimeString('en-IN', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                        <i className="fa-solid fa-arrow-right text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"></i>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <i className="fa-solid fa-inbox text-gray-300 text-5xl mb-3"></i>
                <p className="text-gray-500 font-semibold">No Job Notifications</p>
                <p className="text-gray-400 text-sm mt-1">Check back later for new opportunities!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default NotificationBox

