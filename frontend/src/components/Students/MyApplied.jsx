import { useState, useEffect } from 'react'
import TablePlaceholder from '../TablePlaceholder';
import axios from 'axios';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { BASE_URL } from '../../config/backend_url';

function MyApplied() {
  document.title = 'CPMS | My Applied Job';
  const [loading, setLoading] = useState(true);

  // useState for load data
  const [currentUser, setCurrentUser] = useState({});

  const [jobs, setJobs] = useState([]);

  // checking for authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${BASE_URL}/user/detail`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        setCurrentUser({
          id: res.data.id,
          role: res.data.role,
        });
      })
      .catch(err => {
        console.log("MyApplied.jsx => ", err);
        setToastMessage(err);
        setShowToast(true);
      });
  }, []);


  const fetchMyJob = async () => {
    if (!currentUser?.id) return;
    try {
      const response = await axios.get(`${BASE_URL}/tpo/myjob/${currentUser?.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response?.data)
        setJobs(response?.data)
      // if (response?.data?.msg)
    } catch (error) {
      console.log("Error While Fetching Error => ", error);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyJob();
  }, [currentUser?.id]);

  const renderTooltipViewPost = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      View Post
    </Tooltip>
  );

  return (
    <>
      {
        loading ? (
          <TablePlaceholder />
        ) : (
          <div className="overflow-hidden rounded-lg shadow-lg border border-gray-200 my-6">
            <Table
              hover
              responsive="sm"
              className='mb-0 bg-white text-base max-sm:text-sm'
            >
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '6%' }}>Sr. No.</th>
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '16%' }}>Company</th>
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '16%' }}>Job Title</th>
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '10%' }}>CTC</th>
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '10%' }}>Applied On</th>
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '10%' }}>Deadline</th>
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '10%' }}>Status</th>
                  <th className="px-4 py-3 text-sm font-semibold text-center" style={{ width: '12%' }}>Applicants</th>
                  <th className="px-4 py-3 text-sm font-semibold text-center" style={{ width: '10%' }}>Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {jobs?.length > 0 ? (
                  jobs?.map((job, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-indigo-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-building text-indigo-600 text-xs"></i>
                          <span className="font-semibold text-gray-800">{job?.companyName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          <i className="fa-solid fa-briefcase text-xs text-gray-400"></i>
                          {job?.jobTitle}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">
                        <div className="flex items-center gap-1">
                          <i className="fa-solid fa-indian-rupee-sign text-xs"></i>
                          {job?.salary}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <i className="fa-regular fa-calendar-check text-xs text-blue-500"></i>
                          {new Date(job?.appliedAt.split('T')).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <i className="fa-regular fa-calendar-xmark text-xs text-red-500"></i>
                            {new Date(job?.applicationDeadline).toLocaleDateString('en-IN')}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <i className="fa-regular fa-clock text-xs"></i>
                            {new Date(job?.applicationDeadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {(() => {
                          const status = job?.applicationStatus || job?.status || 'applied';
                          
                          if (status === 'applied') {
                            return (
                              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                <i className="fa-solid fa-paper-plane"></i>
                                Applied
                              </span>
                            );
                          }
                          if (status === 'shortlisted') {
                            return (
                              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                                <i className="fa-solid fa-list-check"></i>
                                Shortlisted
                              </span>
                            );
                          }
                          if (status === 'in-process') {
                            return (
                              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
                                <i className="fa-solid fa-spinner"></i>
                                In Process
                              </span>
                            );
                          }
                          if (status === 'placed') {
                            return (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                <i className="fa-solid fa-circle-check"></i>
                                Placed
                              </span>
                            );
                          }
                          if (status === 'rejected') {
                            return (
                              <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                                <i className="fa-solid fa-circle-xmark"></i>
                                Rejected
                              </span>
                            );
                          }
                          
                          return (
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-600 rounded-full font-bold">
                          {job?.numberOfApplicants}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex justify-center items-center">
                          <OverlayTrigger
                            placement="top"
                            delay={{ show: 250, hide: 400 }}
                            overlay={renderTooltipViewPost}
                          >
                            <Link to={`/student/job/${job.jobId}`}>
                              <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                                <i className='fa-solid fa-eye text-base' />
                              </button>
                            </Link>
                          </OverlayTrigger>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <i className="fa-solid fa-briefcase-blank text-4xl text-gray-300"></i>
                        <p className="mb-0 font-medium">No Applications Found</p>
                        <p className="text-xs text-gray-400">You haven't applied to any jobs yet</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )
      }
    </>
  )
}

export default MyApplied
