import {useState, useEffect } from "react";
import Badge from 'react-bootstrap/Badge';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config/backend_url';

// for management adn tpo admins
function NotificationBox() {
  const [loading, setLoading] = useState(true);
  const [notify, setNotify] = useState([]);
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
    fetchUpdates();
  }, [currentUser?.role]);

  const fetchUpdates = async () => {
    try {
      // Fetch recent placements (finished drives in last 24 hours)
      const response = await axios.get(`${BASE_URL}/tpo/recent-placements`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      const placements = response?.data?.placements || [];
      
      // Transform data to match component structure
      const formattedUpdates = placements.flatMap(placement => 
        placement.placedStudents.map(student => ({
          id: student.studentId,
          studentName: student.name,
          usn: student.usn,
          department: student.department,
          jobs: [{
            jobId: placement.jobId,
            jobTitle: placement.jobTitle,
            companyName: placement.company.name,
            companyLocation: placement.company.location,
            salary: placement.salary,
            status: 'placed',
            placedAt: student.placedAt
          }]
        }))
      );

      setNotify(formattedUpdates);
    } catch (error) {
      console.log('Error while fetching placement updates: ', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="my-2 mx-2 w-full backdrop-blur-md bg-gradient-to-br from-white/40 to-purple-50/30 border border-purple-200/50 rounded-xl py-3 px-4 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-users text-purple-600 text-xl animate-pulse"></i>
            <h3 className="font-bold text-gray-800 text-lg">Student Placement Updates</h3>
          </div>
          {notify?.length > 0 && (
            <span className="bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {notify.length} Updates
            </span>
          )}
        </div>
        {loading ? (
          <div className="flex flex-col justify-center items-center h-72 gap-3">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-purple-600" />
            <p className="text-gray-500 text-sm">Loading placement updates...</p>
          </div>
        ) : (
          <div className="relative h-72 overflow-hidden rounded-lg bg-gradient-to-b from-transparent to-white/50">
            {notify?.length > 0 ? (
              <div className="absolute bottom-0 w-full flex flex-col gap-3 h-full animate-scrollUp">
                {notify.map((student, studentIndex) => (
                  <Link
                    key={studentIndex}
                    className='no-underline block'
                    to={
                      currentUser?.role === 'tpo_admin' ? `/tpo/user/${student.id}`
                        : currentUser?.role === 'management_admin' ? `/management/user/${student.id}` : '#'
                    }
                    target="_blank"
                  >
                    <div className="group p-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-l-4 border-orange-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01]">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            {student.studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className='text-base font-bold text-gray-800 mb-0'>
                              {student.studentName}
                            </p>
                            <p className='text-xs text-gray-600 mb-0'>
                              <span className='font-semibold'>{student.usn}</span>
                              <span className='mx-1'>•</span>
                              <span>{student.department}</span>
                            </p>
                          </div>
                        </div>
                        <i className="fa-solid fa-arrow-right text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all"></i>
                      </div>
                      <div className="flex flex-col gap-2 mt-3 pl-10">
                        {student.jobs.map((job, jobIndex) => (
                          <Link
                            key={jobIndex}
                            className='no-underline block'
                            to={
                              currentUser?.role === 'tpo_admin' ? `/tpo/job/${job?.jobId}`
                                : currentUser?.role === 'management_admin' ? `/management/job/${job?.jobId}` : '#'
                            }
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="group/job p-2 bg-white/70 hover:bg-white rounded-lg border border-orange-200 hover:border-orange-400 transition-all">
                              <div className="flex items-center gap-2 mb-1">
                                <i className="fa-solid fa-building text-orange-600 text-xs"></i>
                                <span className="font-semibold text-gray-800 text-sm group-hover/job:text-orange-600 transition-colors">
                                  {job?.jobTitle}
                                </span>
                                <span className="text-gray-400 text-xs">at</span>
                                <span className="text-gray-700 text-sm font-medium">{job?.companyName}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className='bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1'>
                                  <i className="fa-solid fa-trophy"></i>
                                  Placed
                                </span>
                                {job?.salary && (
                                  <span className='bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1'>
                                    <i className="fa-solid fa-indian-rupee-sign"></i>
                                    {job.salary} LPA
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <i className="fa-solid fa-user-check text-gray-300 text-5xl mb-3"></i>
                <p className="text-gray-500 font-semibold">No Placement Updates</p>
                <p className="text-gray-400 text-sm mt-1">Student placement activities will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default NotificationBox;

