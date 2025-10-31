import {useEffect, useState } from "react";
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Toast from './Toast';
import ModalBox from './Modal';
import { BASE_URL } from '../config/backend_url';
import { useNavigate } from 'react-router-dom';

function SendNotice() {
  document.title = 'CPMS | Send Notice';

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);  // Loading state for initial fetch

  const [data, setData] = useState({});          // Form data state
  const [error, setError] = useState('');        // Error message state

  const [currentUser, setCurrentUser] = useState({ role: '', id: '' });  // Current user state
  const [showToast, setShowToast] = useState(false);                     // Toast visibility
  const [toastMessage, setToastMessage] = useState('');                  // Toast message content
  const [showModal, setShowModal] = useState(false);                     // Modal visibility

  const closeModal = () => setShowModal(false);  // Function to close the modal

  // Fetch current user data and handle authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');  // Redirect to login if no token
      return;
    }

    axios.get(`${BASE_URL}/user/detail`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        setCurrentUser({
          id: res.data.id,
          role: res.data.role,
        });
        setLoading(false);  // End loading once data is fetched
      })
      .catch(err => {
        console.log("SendNotice.jsx => ", err);
        navigate('/login');  // Redirect to login on error
      });
  }, [navigate]);

  // Handle form input changes
  const handleDataChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  // Submit form
  const handleSubmit = () => {
    if (!data?.receiver_role && !data?.title && !data?.message) {
      setError('All Fields Required!');
      return;
    }
    setShowModal(true);  // Show confirmation modal
  }

  // Confirm the submission
  const confirmSubmit = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/management/send-notice`, data, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response?.data?.msg) {
        setToastMessage(response?.data?.msg);
        setShowToast(true);
      }
      navigate(currentUser?.role === 'management_admin' ? '/management/all-notice' : '/tpo/all-notice');
    } catch (error) {
      console.log('Error while sending notice: ', error);
    }
    setShowModal(false);
  }

  // Update data with current user info after user data is loaded
  useEffect(() => {
    if (currentUser?.role && currentUser?.id) {
      setData(prevData => ({
        ...prevData,
        sender: currentUser?.id,
        sender_role: currentUser?.role,
      }));
    }
  }, [currentUser]);

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

      {loading ? (
        <div className="flex justify-center h-72 items-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-slate-500" />
        </div>
      ) : (
        <>
          {/* Page Header */}
          <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-slate-700 text-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-full">
                <i className="fa-solid fa-bell text-3xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Send Notice</h1>
                <p className="text-slate-100 text-sm mt-1">Send important notifications to students or TPO</p>
              </div>
            </div>
          </div>

          <div className="">
            <div className="bg-white/95 border-2 border-slate-200 rounded-xl shadow-lg p-8 max-sm:p-4">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <i className="fa-solid fa-envelope text-slate-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800">Notice Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">

                {/* Receiver Role (Only for Management Admin) */}
                {currentUser?.role === 'management_admin' && (
                  <FloatingLabel
                    controlId="floatingSendTo"
                    label={<span>Receiver Role <span style={{ color: 'red' }}>*</span></span>}
                  >
                    <Form.Select
                      aria-label="Floating label select send to"
                      className="cursor-pointer"
                      name="receiver_role"
                      value={data?.receiver_role || ""}
                      onChange={handleDataChange}
                    >
                      <option disabled value="" className="text-gray-400">
                        Select Receiver Role...
                      </option>
                      <option value="student">Student</option>
                      <option value="tpo_admin">TPO</option>
                    </Form.Select>
                  </FloatingLabel>
                )}

                {/* Title Input */}
                <FloatingLabel
                  controlId="floatingTitle"
                  label={<span>Title <span style={{ color: 'red' }}>*</span></span>}
                  className={currentUser?.role === 'tpo_admin' ? 'col-span-2' : ''}
                >
                  <Form.Control
                    type="text"
                    placeholder="Title"
                    name='title'
                    value={data?.title || ""}
                    onChange={handleDataChange}
                  />
                </FloatingLabel>

                {/* Message Input */}
                <div className="col-span-2">
                  <FloatingLabel
                    controlId="floatingMessage"
                    label={<span>Message <span style={{ color: 'red' }}>*</span></span>}
                  >
                    <Form.Control
                      as="textarea"
                      placeholder="Message"
                      name='message'
                      style={{ maxHeight: "250px", height: "200px" }}
                      value={data?.message || ""}
                      onChange={handleDataChange}
                    />
                  </FloatingLabel>
                </div>
              </div>

              {/* Error Display */}
              <div className="mt-2">
                <span className='text-center text-red-500'>
                  {error && error}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                type="button"
                onClick={handleSubmit}
                className="px-8 py-3 bg-gradient-to-r from-slate-600 to-gray-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <i className="fa-solid fa-paper-plane" />
                Send Notice
              </button>
              <button 
                type='button'
                onClick={() => navigate(-1)}
                className="px-8 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg shadow hover:bg-slate-300 transition-colors duration-300 flex items-center gap-2"
              >
                <i className="fa-solid fa-xmark"></i>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* ModalBox Component */}
      <ModalBox
        show={showModal}
        close={closeModal}
        header={"Confirmation"}
        body={`Sending Notice ${data?.message ? `"${data?.message}"` : ""} to ${data?.receiver_role || "student"}?`}
        btn={"Send"}
        confirmAction={confirmSubmit}
      />
    </>
  )
}

export default SendNotice;

