import {useState, useEffect } from "react";
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import Placeholder from 'react-bootstrap/Placeholder';
import { useLocation, useNavigate } from 'react-router-dom';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import ModalBox from './Modal';
import Toast from './Toast';
import TablePlaceholder from './TablePlaceholder';
import { BASE_URL } from '../config/backend_url';

function AllJobPost() {
  document.title = 'CPMS | Job Listings';
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState({});
  const [currentUser, setCurrentUser] = useState(null);  // Set to null initially

  // Toast and Modal states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [dataToParasModal, setDataToParasModal] = useState(null);
  const [modalBody, setModalBody] = useState({
    cmpName: '',
    jbTitle: ''
  });

  // Checking for authentication and fetching user details
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
          email: res.data.email,
          role: res.data.role,
        });
        fetchJobs();  // Fetch jobs only after the user info is loaded
      })
      .catch(err => {
        console.log("Error in fetching user details => ", err);
        setToastMessage(err.message || 'Error loading user data');
        setShowToast(true);
      });
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/tpo/jobs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setJobs(response.data.data);
      fetchCompanies(response.data.data);
    } catch (error) {
      console.log("Error fetching jobs ", error);
      if (error?.response?.data?.msg) {
        setToastMessage(error.response.data.msg);
        setShowToast(true);
      }
    }
  };

  const fetchCompanies = async (jobs) => {
    const companyNames = {};
    for (const job of jobs) {
      if (job.company && !companyNames[job.company]) {
        try {
          const response = await axios.get(`${BASE_URL}/company/company-data?companyId=${job.company}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
          });
          companyNames[job.company] = response.data.company.companyName;
        } catch (error) {
          console.log("Error fetching company name => ", error);
        }
      }
    }
    setCompanies(companyNames);
    setLoading(false);
  };

  const handleDeletePost = (jobId, cmpName, jbTitle) => {
    setDataToParasModal(jobId);
    setModalBody({
      cmpName: cmpName,
      jbTitle: jbTitle
    });
    setShowModal(true);
  };

  const confirmDelete = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/tpo/delete-job`, 
        { jobId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setShowModal(false);
      fetchJobs();
      if (response?.data?.msg) {
        setToastMessage(response?.data?.msg);
        setShowToast(true);
      }
    } catch (error) {
      if (error?.response?.data?.msg) {
        setToastMessage(error?.response?.data?.msg);
        setShowToast(true);
      }
      console.log("Error deleting job ", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setDataToParasModal(null);
  };

  const { showToastPass, toastMessagePass } = location.state || { showToastPass: false, toastMessagePass: '' };

  useEffect(() => {
    if (showToastPass) {
      setToastMessage(toastMessagePass);
      setShowToast(showToastPass);
      navigate('.', { replace: true, state: {} });
    }
    if (!jobs) setLoading(false);
  }, []);

  return (
    <>
      {/* Toast Component */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
        position="bottom-end"
      />

      <div className=''>
        {
          loading || !currentUser ? (
            <TablePlaceholder />
          ) : (
            <div className="overflow-hidden rounded-lg shadow-lg border border-gray-200 my-6">
              <Table hover responsive="sm" className='mb-0 bg-white text-base max-sm:text-sm'>
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold" style={{ width: '7%' }}>Sr. No.</th>
                    <th className="px-4 py-3 text-sm font-semibold" style={{ width: '20%' }}>Company</th>
                    <th className="px-4 py-3 text-sm font-semibold" style={{ width: '20%' }}>Job Title</th>
                    <th className="px-4 py-3 text-sm font-semibold" style={{ width: '12%' }}>CTC</th>
                    <th className="px-4 py-3 text-sm font-semibold" style={{ width: '13%' }}>Deadline</th>
                    <th className="px-4 py-3 text-sm font-semibold text-center" style={{ width: '13%' }}>Applicants</th>
                    <th className="px-4 py-3 text-sm font-semibold text-center" style={{ width: '15%' }}>Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {jobs?.length > 0 ? (
                    jobs?.map((job, index) => {
                      const isMatched = job?.applicants?.find(student => student.studentId == currentUser.id);
                      return (
                        <tr
                          key={job?._id}
                          className={`border-b border-gray-100 hover:bg-indigo-50 transition-colors ${isMatched ? 'bg-green-50' : ''}`}
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <i className="fa-solid fa-building text-indigo-600 text-xs"></i>
                              <span className="font-semibold text-gray-800">
                                {companies[job?.company] || <Placeholder as="span" animation="glow">
                                  <Placeholder xs={8} />
                                </Placeholder>}
                              </span>
                              {isMatched && (
                                <span className="ml-2 inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                                  <i className="fa-solid fa-check"></i>
                                  Applied
                                </span>
                              )}
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
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <i className="fa-regular fa-calendar text-xs text-red-500"></i>
                                {new Date(job?.applicationDeadline).toLocaleDateString('en-In')}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <i className="fa-regular fa-clock text-xs"></i>
                                {new Date(job?.applicationDeadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-center">
                            <span className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-600 rounded-full font-bold">
                              {job?.applicants?.length || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex justify-center items-center gap-2">
                              {/* View Post */}
                              <OverlayTrigger
                                placement="top"
                                delay={{ show: 250, hide: 400 }}
                                overlay={<Tooltip>View Details</Tooltip>}
                              >
                                <button
                                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                                  onClick={() => {
                                    const rolePaths = {
                                      'tpo_admin': `../tpo/job/${job._id}`,
                                      'management_admin': `../management/job/${job._id}`,
                                      'superuser': `../admin/job/${job._id}`,
                                      'student': `../student/job/${job._id}`,
                                    };
                                    navigate(rolePaths[currentUser.role]);
                                  }}
                                >
                                  <i className="fa-solid fa-eye text-base"></i>
                                </button>
                              </OverlayTrigger>
                              {
                                currentUser.role !== 'student' && (
                                  <>
                                    {/* Edit Post */}
                                    <OverlayTrigger
                                      placement="top"
                                      delay={{ show: 250, hide: 400 }}
                                      overlay={<Tooltip>Edit Post</Tooltip>}
                                    >
                                      <button
                                        className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all"
                                        onClick={() => {
                                          const rolePaths = {
                                            'tpo_admin': `../tpo/post-job/${job._id}`,
                                            'management_admin': `../management/post-job/${job._id}`,
                                            'superuser': `../admin/post-job/${job._id}`,
                                          };
                                          navigate(rolePaths[currentUser.role]);
                                        }}
                                      >
                                        <i className="fa-solid fa-pen-to-square text-base"></i>
                                      </button>
                                    </OverlayTrigger>

                                    {/* Delete Post */}
                                    <OverlayTrigger
                                      placement="top"
                                      delay={{ show: 250, hide: 400 }}
                                      overlay={<Tooltip>Delete Post</Tooltip>}
                                    >
                                      <button
                                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                                        onClick={() => handleDeletePost(job?._id, companies[job?.company], job?.jobTitle)}
                                      >
                                        <i className="fa-solid fa-trash-can text-base"></i>
                                      </button>
                                    </OverlayTrigger>
                                  </>
                                )
                              }
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <i className="fa-solid fa-briefcase text-4xl text-gray-300"></i>
                          <p className="mb-0 font-medium">No Job Posts Found!</p>
                          <p className="text-xs text-gray-400">Check back later for new opportunities</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>



          )
        }
      </div>

      {/* Modal Box for Confirm Delete */}
      <ModalBox
        show={showModal}
        close={closeModal}
        header={`Confirm Delete - ${modalBody?.cmpName}`}
        body={`Are you sure you want to delete "${modalBody?.jbTitle}" from ${modalBody?.cmpName}? This action cannot be undone.`}
        btn="Delete"
        confirmAction={() => confirmDelete(dataToParasModal)}
      />
    </>
  );
}

export default AllJobPost;

