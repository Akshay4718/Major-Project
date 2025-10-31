import {useEffect, useState } from "react";
import axios from 'axios';
import { Link } from 'react-router-dom';
import Badge from 'react-bootstrap/Badge';
import { BASE_URL } from '../../config/backend_url';

function Home() {
  document.title = 'CPMS | Admin Dashboard';

  const [countUsers, setCountUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/user/all-users`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        setCountUsers(response.data);
      } catch (error) {
        console.log("Home.jsx => ", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return (
    <>
      {loading ? (
        <div className="flex justify-center h-72 items-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-slate-500" />
        </div>
      ) : (
        <>
          {/* Page Header */}
          <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-slate-700 text-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-full">
                <i className="fa-solid fa-chart-line text-3xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-slate-100 text-sm mt-1">Overview of all users in the system</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-col gap-8 justify-center items-center flex-wrap">
              <div className="w-full px-4 flex flex-wrap justify-center items-center gap-6">
              <Link className='no-underline' to='../admin/management'>
                <div className="bg-white/95 border-2 border-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6 h-48 w-64 flex flex-col justify-center items-center gap-4 max-sm:h-40 max-sm:w-56">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <i className="fa-solid fa-user-tie text-blue-600 text-4xl"></i>
                  </div>
                  <div className="text-center">
                    <p className='text-sm font-semibold text-gray-600 mb-1'>Management Admin</p>
                    <p className='text-4xl font-bold text-blue-600'>{countUsers.managementUsers}</p>
                  </div>
                </div>
              </Link>
              <Link className='no-underline' to='../admin/tpo'>
                <div className="bg-white/95 border-2 border-green-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6 h-48 w-64 flex flex-col justify-center items-center gap-4 max-sm:h-40 max-sm:w-56">
                  <div className="p-4 bg-green-100 rounded-full">
                    <i className="fa-solid fa-user-gear text-green-600 text-4xl"></i>
                  </div>
                  <div className="text-center">
                    <p className='text-sm font-semibold text-gray-600 mb-1'>TPO Admin</p>
                    <p className='text-4xl font-bold text-green-600'>{countUsers.tpoUsers}</p>
                  </div>
                </div>
              </Link>
              <Link className='no-underline' to='../admin/student'>
                <div className="bg-white/95 border-2 border-purple-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6 h-48 w-64 flex flex-col justify-center items-center gap-4 max-sm:h-40 max-sm:w-56">
                  <div className="p-4 bg-purple-100 rounded-full">
                    <i className="fa-solid fa-user-graduate text-purple-600 text-4xl"></i>
                  </div>
                  <div className="text-center">
                    <p className='text-sm font-semibold text-gray-600 mb-1'>Student User</p>
                    <p className='text-4xl font-bold text-purple-600'>{countUsers.studentUsers}</p>
                  </div>
                </div>
              </Link>
              <div className="bg-white/95 border-2 border-slate-300 rounded-xl shadow-lg p-6 h-48 w-64 flex flex-col justify-center items-center gap-4 max-sm:h-40 max-sm:w-56">
                <div className="p-4 bg-slate-200 rounded-full">
                  <i className="fa-solid fa-user-shield text-slate-600 text-4xl"></i>
                </div>
                <div className="text-center">
                  <p className='text-sm font-semibold text-gray-600 mb-1'>Superuser</p>
                  <p className='text-4xl font-bold text-slate-600'>{countUsers.superUsers}</p>
                </div>
              </div>
            </div>
            {
              countUsers.studentApprovalPendingUsers !== 0 &&
              (
                <Link className='no-underline w-full max-w-xl' to='../admin/approve-student'>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-orange-100 rounded-full">
                        <i className="fa-solid fa-user-clock text-orange-600 text-3xl"></i>
                      </div>
                      <div>
                        <p className='text-lg font-bold text-gray-800 mb-1'>Student Approval Pending</p>
                        <Badge bg="warning" pill className='text-sm'>Action Needed</Badge>
                      </div>
                    </div>
                    <div className="text-5xl font-bold text-orange-600">{countUsers.studentApprovalPendingUsers}</div>
                  </div>
                </Link>
              )
            }

          </div>
        </div>
        </>
      )
      }
    </>
  )
}

export default Home

