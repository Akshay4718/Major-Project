import {useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Toast from '../Toast';
import ModalBox from '../Modal';
import { BASE_URL } from '../../config/backend_url';

function AddInternship() {
  document.title = 'CPMS | Add Internships';
  const [loading, setLoading] = useState(true);
  const { internshipId } = useParams();
  const navigate = useNavigate();

  // useState for toast display
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // useState for Modal display
  const [showModal, setShowModal] = useState(false);
  const [modalBody, setModalBody] = useState('');

  const closeModal = () => setShowModal(false);

  // store internship info
  const [internship, setInternship] = useState({});

  const [currentUserData, setCurrentUserData] = useState('');

  useEffect(() => {
    const fetchCurrentUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/user/detail`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setCurrentUserData({ id: response.data.id });
        if (!internshipId) setLoading(false);
      } catch (error) {
        console.log("addinternship.jsx => ", error);
      }
    }
    fetchCurrentUserData();
  }, []);

  const fetchInternshipData = async () => {
    try {
      // if no studentId or internshipId then return back none 
      if (!currentUserData?.id || !internshipId) return;
      const response = await axios.get(`${BASE_URL}/student/internship?studentId=${currentUserData?.id}&internshipId=${internshipId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      // console.log(response?.data);
      setInternship(response.data.internship);
      setModalBody(response.data.internship.companyName);
      if (response?.data?.msg) {
        setToastMessage(response?.data?.msg);
        setShowToast(true);
      }
    } catch (error) {
      console.log("error while updating internship ", error);
      if (error.response?.data?.msg) {
        setToastMessage(error?.response?.data?.msg);
      } else {
        setToastMessage("Error while updating internship please try again later!");
      }
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  }

  const handleDataChange = (e) => {
    setInternship({ ...internship, [e.target.name]: e.target.value });
    if (e.target.name === "companyName")
      setModalBody(e.target.value);
  }

  // for formating date of birth
  const formatDate = (isoString) => {
    if (!isoString || isoString === "undefined") return "";
    const date = new Date(isoString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  const handleSubmit = () => {
    if (!internship?.companyName || !internship?.internshipDuration || !internship?.startDate || !internship?.type) {
      setToastMessage('Star Marked Required!');
      setShowToast(true);
      return;
    }
    setShowModal(true);
  }

  const confirmSubmit = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/student/update-internship?studentId=${currentUserData?.id}&internshipId=${internshipId}`, { internship }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      // console.log(response?.data);
      if (response?.data?.msg) {
        setToastMessage(response?.data?.msg);
        setShowToast(true);
        if (response?.data?.msg === "Internship Updated Successfully!") {
          const dataToPass = {
            showToastPass: true,
            toastMessagePass: response?.data?.msg
          }
          navigate('/student/internship', { state: dataToPass })
        }
      }
    } catch (error) {
      console.log("error while updating internship ", error);
      if (error.response?.data?.msg) {
        setToastMessage(error?.response?.data?.msg);
      } else {
        setToastMessage("Error while updating internship please try again later!");
      }
      setShowToast(true);
    }
    setShowModal(false);
  }


  useEffect(() => {
    fetchInternshipData();
  }, [currentUserData?.id]);

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

      {
        loading ? (
          <div className="flex justify-center h-72 items-center">
            <i className="fa-solid fa-spinner fa-spin text-3xl" />
          </div>
        ) : (
          <>
            <div className="my-8 backdrop-blur-md bg-white/90 border-2 border-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-full">
                  <i className="fa-solid fa-briefcase text-blue-600 text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Add Internship Experience</h2>
                  <p className="text-sm text-gray-600">Fill in your internship details below</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <FloatingLabel controlId="floatingCompanyName" label={
                  <>
                    <span>Company Name <span style={{ color: 'red' }}>*</span></span>
                  </>
                }>
                  <Form.Control
                    type="text"
                    placeholder="Company Name"
                    name='companyName'
                    value={internship?.companyName || ""}
                    onChange={handleDataChange}
                  />
                </FloatingLabel >
                <FloatingLabel controlId="floatingCompanyWebsite" label="Company Website">
                  <Form.Control
                    type="link"
                    placeholder="Company Website"
                    name='companyWebsite'
                    value={internship?.companyWebsite || ""}
                    onChange={handleDataChange}
                  />
                </FloatingLabel>
                <FloatingLabel controlId="floatingInternshipDuration" label={
                  <>
                    <span>Internship Duration In Days <span style={{ color: 'red' }}>*</span></span>
                  </>
                }
                >
                  <Form.Control
                    type="number"
                    step={1}
                    placeholder="Internship Duration"
                    name='internshipDuration'
                    value={internship?.internshipDuration || ""}
                    onChange={handleDataChange}
                  />
                </FloatingLabel>
                <FloatingLabel controlId="floatingMonthlyStipend" label="Monthly Stipend in Rupees">
                  <Form.Control
                    type="number"
                    step={500}
                    placeholder="Monthly Stipend in Rupees"
                    name='monthlyStipend'
                    value={internship?.monthlyStipend || ""}
                    onChange={handleDataChange}
                  />
                </FloatingLabel>
                <FloatingLabel controlId="floatingStartDate" label={
                  <>
                    <span>Internship Start Date <span style={{ color: 'red' }}>*</span></span>
                  </>
                }>
                  <Form.Control
                    type="date"
                    placeholder="Internship Start Date"
                    name='startDate'
                    value={formatDate(internship?.startDate) || ""}
                    onChange={handleDataChange}
                  />
                </FloatingLabel>
                <FloatingLabel controlId="floatingEndDate" label="End Date">
                  <Form.Control
                    type="date"
                    placeholder="Internship End Date"
                    name='endDate'
                    value={formatDate(internship?.endDate) || ""}
                    onChange={handleDataChange}
                  />
                </FloatingLabel>
                <FloatingLabel controlId="floatingSelectType" label={
                  <>
                    <span>Select Internship Type <span style={{ color: 'red' }}>*</span></span>
                  </>
                }>
                  <Form.Select
                    aria-label="Floating label select internship type"
                    className='cursor-pointer'
                    name='type'
                    value={internship?.type || "undefined"}
                    onChange={handleDataChange}
                  >
                    <option disabled value="undefined" className='text-gray-400'>Select Internship Type</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="On-Site">On-Site</option>
                    <option value="Work From Home">Work From Home</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </FloatingLabel>
                <FloatingLabel controlId="floatingCompanyAddress" label="Company Address">
                  <Form.Control
                    as="textarea"
                    placeholder="Company Address"
                    name='companyAddress'
                    style={{ maxHeight: "200px" }}
                    value={internship?.companyAddress || ""}
                    onChange={handleDataChange}
                  />
                </FloatingLabel>
                <div className="col-span-2 max-sm:col-span-1">
                  <FloatingLabel controlId="floatingDescription" label="Internship Description">
                    <Form.Control
                      as="textarea"
                      placeholder="Internship Description"
                      name='description'
                      style={{ maxHeight: "350px", minHeight: "150px" }}
                      value={internship?.description || ""}
                      onChange={handleDataChange}
                    />
                  </FloatingLabel>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center gap-4 mt-6">
              <button 
                type='button'
                onClick={handleSubmit}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                {internshipId ? 'Update Internship' : 'Add Internship'}
              </button>
              <button 
                type='button'
                onClick={() => navigate(-1)}
                className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow hover:bg-gray-300 transition-colors duration-300 flex items-center gap-2"
              >
                <i className="fa-solid fa-xmark"></i>
                Cancel
              </button>
            </div>
          </>
        )
      }


      {/* ModalBox Component for Delete Confirmation */}
      <ModalBox
        show={showModal}
        close={closeModal}
        header={"Confirmation"}
        body={`Do you add internship ${modalBody ? `of ${modalBody}` : ''}?`}
        btn={"Update"}
        confirmAction={confirmSubmit}
      />
    </>
  )
}

export default AddInternship

