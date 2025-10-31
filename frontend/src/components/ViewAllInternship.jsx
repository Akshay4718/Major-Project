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

function AddInternship() {
  document.title = 'CPMS | My Internships';
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState([]);

  // useState for toast display
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // useState for Modal display
  const [showModal, setShowModal] = useState(false);
  const [modalBody, setModalBody] = useState({});
  const [dataToParasModal, setDataToParasModal] = useState('');

  // useState for load data
  const [currentUser, setCurrentUser] = useState({});

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
          email: res.data.email,
          role: res.data.role,
        });
      })
      .catch(err => {
        console.log("AddUserTable.jsx => ", err);
        setToastMessage(err);
        setShowToast(true);
      });

    // calling function fetch jobs
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      if (!currentUser?.id) return;
      const response = await axios.get(`${BASE_URL}/student/internship?studentId=${currentUser?.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setInternships(response.data.internships);
      // console.log(response.data);
      if (response?.data?.msg) {
        setToastMessage(response?.data?.msg);
        setShowToast(true);
      }
      setLoading(false);
    } catch (error) {
      console.log("Error fetching jobs ", error);
      if (error?.response?.data?.msg) {
        setToastMessage(error.response.data.msg);
        setShowToast(true);
      }
    }
  }

  useEffect(() => {
    fetchInternships();
  }, [currentUser?.id]);

  const handleDeleteInternship = (internshipId, cmpName) => {
    setDataToParasModal(internshipId);
    setModalBody({
      cmpName: cmpName,
    });
    setShowModal(true);
  }

  const confirmDelete = async (internshipId) => {
    try {
      const response = await axios.post(`${BASE_URL}/student/delete-internship`, { internshipId, studentId: currentUser.id }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      setShowModal(false);
      fetchInternships();
      if (response?.data?.msg) {
        setToastMessage(response?.data?.msg);
        setShowToast(true);
      }
      // setLoading(false);
    } catch (error) {
      if (error?.response?.data?.msg) {
        setToastMessage(error?.response?.data?.msg);
        setShowToast(true);
      }
      console.log("Error deleting job ", error);
    }
  }


  const renderTooltipEditInternship = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Edit Internship Detail
    </Tooltip>
  );

  const renderTooltipDeleteInternship = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Delete Internship
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
                  className='mb-0 bg-white text-base max-lg:text-sm'
                >
                  <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold" style={{ width: '6%' }}>Sr. No.</th>
                      <th className="px-4 py-3 text-sm font-semibold" style={{ width: '16%' }}>Company</th>
                      <th className="px-4 py-3 text-sm font-semibold" style={{ width: '13%' }}>Website</th>
                      <th className="px-4 py-3 text-sm font-semibold" style={{ width: '14%' }}>Start Date</th>
                      <th className="px-4 py-3 text-sm font-semibold" style={{ width: '14%' }}>End Date</th>
                      <th className="px-4 py-3 text-sm font-semibold" style={{ width: '13%' }}>Duration</th>
                      <th className="px-4 py-3 text-sm font-semibold" style={{ width: '11%' }}>Stipend</th>
                      <th className="px-4 py-3 text-sm font-semibold text-center" style={{ width: '13%' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {internships?.length > 0 ? (
                      internships?.map((internship, index) => (
                        <tr key={internship?._id} className="border-b border-gray-100 hover:bg-indigo-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <i className="fa-solid fa-building text-indigo-600 text-xs"></i>
                              <span className="font-semibold text-gray-800">{internship?.companyName || '-'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {
                              internship?.companyWebsite ? (
                                <a href={internship?.companyWebsite} target='_blank' className='no-underline text-indigo-600 hover:text-indigo-800 flex items-center gap-1'>
                                  <i className="fa-solid fa-globe text-xs"></i>
                                  {internship?.companyWebsite}
                                </a>
                              ) : <span className="text-gray-400">-</span>
                            }
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <i className="fa-regular fa-calendar text-xs text-green-500"></i>
                              {new Date(internship?.startDate).toLocaleDateString('en-IN') || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <i className="fa-regular fa-calendar text-xs text-red-500"></i>
                              {new Date(internship?.endDate).toLocaleDateString('en-IN') || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                              <i className="fa-regular fa-hourglass"></i>
                              {internship?.internshipDuration ? internship?.internshipDuration + " days" : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">
                            <div className="flex items-center gap-1">
                              <i className="fa-solid fa-indian-rupee-sign text-xs"></i>
                              {internship?.monthlyStipend || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex justify-center items-center gap-2">
                              {/* edit internship  */}
                              <OverlayTrigger
                                placement="top"
                                delay={{ show: 250, hide: 400 }}
                                overlay={renderTooltipEditInternship}
                              >
                                <button
                                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                                  onClick={() => navigate(`../student/add-internship/${internship._id}`)}
                                >
                                  <i className="fa-solid fa-pen-to-square text-base"></i>
                                </button>
                              </OverlayTrigger>
                              {/* delete internship  */}
                              <OverlayTrigger
                                placement="top"
                                delay={{ show: 250, hide: 400 }}
                                overlay={renderTooltipDeleteInternship}
                              >
                                <button
                                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                                  onClick={() => handleDeleteInternship(internship?._id, internship?.companyName)}
                                >
                                  <i className="fa-solid fa-trash-can text-base"></i>
                                </button>
                              </OverlayTrigger>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <i className="fa-solid fa-laptop-code text-4xl text-gray-300"></i>
                            <p className="mb-0 font-medium">No Internships Added Yet!</p>
                            <p className="text-xs text-gray-400">Add your internship experience to showcase your skills</p>
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
          body={`Do you want to delete internship of ${modalBody.cmpName}?`}
          btn={"Delete"}
          confirmAction={() => confirmDelete(dataToParasModal)}
        />
      </>
    </>
  )
}

export default AddInternship

