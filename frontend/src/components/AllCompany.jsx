import {useState, useEffect } from "react";
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import Placeholder from 'react-bootstrap/Placeholder';
import { useLocation, useNavigate } from 'react-router-dom';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import ModalBox from './Modal';
import Toast from './Toast';
import { BASE_URL } from '../config/backend_url';
import TablePlaceholder from './TablePlaceholder';

function AllCompany() {
  document.title = 'CPMS | All Company';

  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [companys, setCompanys] = useState({});
  const [jobs, setJobs] = useState({});

  const [modalBody, setModalBody] = useState({
    companyName: "",
    companyId: ""
  });

  // useState for toast display
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // useState for Modal display
  const [showModal, setShowModal] = useState(false);

  // stores only user role
  const [currentUser, setCurrentUser] = useState('');

  const fetchCurrentUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/user/detail`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (response?.data) setCurrentUser(response?.data?.role);
    } catch (error) {
      console.log("Account.jsx => ", error);
    }
  }

  const fetchCompanys = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/company/company-detail`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setCompanys(response.data.companys);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching jobs ", error);
      if (error?.response?.data?.msg) {
        setToastMessage(error.response.data.msg);
        setShowToast(true);
      }
    }
  }

  const handleDeleteCompany = (companyName, companyId) => {
    setModalBody({ companyId: companyId, companyName: companyName });
    setShowModal(true);
  }

  const confirmDelete = async (companyId) => {
    console.log('Deleting company with ID:', companyId);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setToastMessage('Authentication required. Please login again.');
        setShowToast(true);
        setShowModal(false);
        return;
      }

      console.log('Sending delete request to:', `${BASE_URL}/company/delete-company`);
      
      const response = await axios.post(`${BASE_URL}/company/delete-company`,
        { companyId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        },
      );

      console.log('Delete response:', response.data);
      
      setShowModal(false);
      
      if (response?.data?.msg) {
        setToastMessage(response?.data?.msg);
        setShowToast(true);
      }
      
      // Refresh company list
      await fetchCompanys();
    } catch (error) {
      console.error("Error deleting company => ", error);
      console.error("Error response:", error?.response?.data);
      
      setShowModal(false);
      
      if (error?.response?.data?.msg) {
        setToastMessage(error?.response?.data?.msg);
      } else if (error?.message) {
        setToastMessage(`Error: ${error.message}`);
      } else {
        setToastMessage('Failed to delete company. Please try again.');
      }
      setShowToast(true);
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/tpo/jobs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setJobs(response.data.data);
    } catch (error) {
      console.log("Error fetching jobs ", error);
      if (error?.response?.data?.msg) {
        setToastMessage(error.response.data.msg);
        setShowToast(true);
      }
    }
  }

  const renderTooltipDeleteCompany = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Delete Company
    </Tooltip>
  );

  const renderTooltipEditCompany = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Edit Company
    </Tooltip>
  );


  const closeModal = () => setShowModal(false);

  const { showToastPass, toastMessagePass } = location.state || { showToastPass: false, toastMessagePass: '' };

  useEffect(() => {
    if (showToastPass) {
      setToastMessage(toastMessagePass);
      setShowToast(showToastPass);
      // Clear the state after the toast is shown
      navigate('.', { replace: true, state: {} });
    }
    fetchCurrentUserData();
    fetchCompanys();
    fetchJobs();
  }, []);


  return (
    <>
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
            loading ? (
              // fake table loading animation 
              <TablePlaceholder />
            ) : (
              <div className="overflow-hidden rounded-lg shadow-lg border border-gray-200 my-6">
                <Table
                  hover
                  responsive="sm"
                  className='mb-0 bg-white w-full text-base max-sm:text-sm'
                >
                  <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold" style={{ width: '7%' }}>Sr. No.</th>
                      <th className="px-4 py-3 text-sm font-semibold" style={{ width: '18%' }}>Company Name</th>
                      <th className="px-4 py-3 text-sm font-semibold" style={{ width: '15%' }}>Website</th>
                      <th className="px-4 py-3 text-sm font-semibold" style={{ width: '15%' }}>Location</th>
                      <th className="px-4 py-3 text-sm font-semibold" style={{ width: '17%' }}>Difficulty</th>
                      <th className="px-4 py-3 text-sm font-semibold text-center" style={{ width: '13%' }}>Jobs Posted</th>
                      <th className="px-4 py-3 text-sm font-semibold text-center" style={{ width: '15%' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {companys?.length > 0 ? (
                      companys?.map((company, index) => (
                        <tr key={company?._id} className="border-b border-gray-100 hover:bg-indigo-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <i className="fa-solid fa-building text-indigo-600 text-xs"></i>
                              <span className="font-semibold text-gray-800">{company?.companyName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <a
                              href={company?.companyWebsite}
                              target="_blank"
                              className='text-indigo-600 hover:text-indigo-800 no-underline flex items-center gap-1'
                              rel="noopener noreferrer"
                            >
                              <i className="fa-solid fa-globe text-xs"></i>
                              {company?.companyWebsite}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <i className="fa-solid fa-location-dot text-xs text-gray-400"></i>
                              {company?.companyLocation}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {company?.companyDifficulty === "Easy" && (
                              <span className='inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold'>
                                <i className="fa-solid fa-circle-check"></i>
                                Easy
                              </span>
                            )}
                            {company?.companyDifficulty === "Moderate" && (
                              <span className='inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold'>
                                <i className="fa-solid fa-circle-minus"></i>
                                Moderate
                              </span>
                            )}
                            {company?.companyDifficulty === "Hard" && (
                              <span className='inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold'>
                                <i className="fa-solid fa-circle-xmark"></i>
                                Hard
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-center">
                            <span className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-600 rounded-full font-bold">
                              {jobs.length
                                ? jobs?.filter(job => job?.company == company?._id)?.length
                                : "0"
                              }
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {/* for hover label effect  */}
                            <div className="flex justify-center items-center gap-2">
                              {/* edit company  */}
                              <OverlayTrigger
                                placement="top"
                                delay={{ show: 250, hide: 400 }}
                                overlay={renderTooltipEditCompany}
                              >
                                <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                                  <i
                                    className="fa-solid fa-pen-to-square text-base cursor-pointer"
                                    onClick={() => {
                                      if (currentUser === 'tpo_admin') navigate(`../tpo/add-company/${company._id}`)
                                      else if (currentUser === 'management_admin') navigate(`../management/add-company/${company._id}`);
                                      else if (currentUser === 'superuser') navigate(`../admin/add-company/${company._id}`);
                                    }}
                                  />
                                </button>
                              </OverlayTrigger>
                              {/* delete company  */}
                              <OverlayTrigger
                                placement="top"
                                delay={{ show: 250, hide: 400 }}
                                overlay={renderTooltipDeleteCompany}
                              >
                                <button className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all">
                                  <i
                                    className="fa-solid fa-trash-can text-base cursor-pointer"
                                    onClick={() => handleDeleteCompany(company?.companyName, company?._id)}
                                  />
                                </button>
                              </OverlayTrigger>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <i className="fa-solid fa-building-slash text-4xl text-gray-300"></i>
                            <p className="mb-0 font-medium">No Companies Found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )
          }
        </div >


        {/* ModalBox Component for Delete Confirmation */}
        <ModalBox
          show={showModal}
          close={closeModal}
          header={"Confirmation"}
          body={`Do you want to delete company ${modalBody.companyName}?`}
          btn={"Delete"}
          confirmAction={() => confirmDelete(modalBody.companyId)}
        />
      </>
    </>
  )
}

export default AllCompany

