import {useState } from "react";
import { Form, FloatingLabel } from 'react-bootstrap';
import { GrFormAdd } from 'react-icons/gr';
import axios from 'axios';
import Toast from '../Toast';
import ModalBox from '../Modal';
import { BASE_URL } from '../../config/backend_url';
import { useLocation } from 'react-router-dom';

function AddNewUser() {
  document.title = 'CPMS | Add new user';

  const location = useLocation();
  // filter management or tpo or student to add
  const userToAdd = location.pathname.split('/').filter(link => link !== '' && link !== 'admin' && link !== 'management')[0].split('-').filter(link => link !== 'add' && link !== 'admin')[0];


  const [data, setData] = useState({
    first_name: "",
    email: "",
    number: ""
  });

  // for error message
  const [error, setError] = useState({});

  // useState for toast display
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // useState for Modal display
  const [showModal, setShowModal] = useState(false);

  const closeModal = () => setShowModal(false);

  const handleDataChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleModalSubmit = (e) => {
    e.preventDefault();

    let newError = {};

    if (!data?.first_name) newError.first_name = 'Name Required!';
    if (!data?.email) newError.email = 'Email Required!';
    if (!data?.number) newError.number = 'Number Required!';

    // If any errors were found, set them and return early to prevent the modal from opening
    if (Object.keys(newError).length > 0) return setError(newError);

    setShowModal(true);
  };

  const handleSubmitManagement = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/management/add-management`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );
      if (response?.data) {
        setToastMessage(response?.data?.msg);
        setShowToast(true);

        setData({
          first_name: "",
          email: "",
          number: ""
        });
      }
    } catch (error) {
      console.log("handleSubmit => AddManagement.jsx ==> ", error);
    }
    setShowModal(false);
  }

  const handleSubmitTPO = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/management/addtpo`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );
      if (response?.data) {
        setToastMessage(response?.data?.msg);
        setShowToast(true);

        setData({
          first_name: "",
          email: "",
          number: ""
        });
      }
    } catch (error) {
      console.log("handleSubmit => AddTPO.jsx ==> ", error);
    }
    setShowModal(false);
  }

  const handleSubmitStudent = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/management/add-student`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );
      if (response?.data) {
        setToastMessage(response?.data?.msg);
        setShowToast(true);

        setData({
          first_name: "",
          email: "",
          number: ""
        });
      }
    } catch (error) {
      console.log("handleSubmit => AddStudent.jsx ==> ", error);
    }
    setShowModal(false);
  }

  return (
    <>
      {/*  Toast Message */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
        position="top-center"
      />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-slate-700 text-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-full">
            <i className={`text-3xl ${
              userToAdd === 'management' ? 'fa-solid fa-user-tie' :
              userToAdd === 'tpo' ? 'fa-solid fa-user-gear' :
              'fa-solid fa-user-graduate'
            }`}></i>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Add New {userToAdd === 'tpo' ? 'TPO' : userToAdd === 'management' ? 'Management' : 'Student'}</h1>
            <p className="text-slate-100 text-sm mt-1">Create a new user account with email notification</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center text-base max-sm:text-sm">
        <div className="bg-white/95 border-2 border-slate-200 rounded-xl p-8 shadow-lg w-full max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-slate-100 rounded-lg">
              <i className="fa-solid fa-user-plus text-slate-600 text-xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800">User Details</h3>
          </div>
          <Form onSubmit={handleModalSubmit} className='flex flex-col'>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-x-3 gap-y-6 max-sm:grid-cols-1 max-sm:gap-x-1 max-sm:gap-y-1">
                <div className="">
                  <FloatingLabel label={
                    <>
                      <span>Name <span className='text-red-500'>*</span></span>
                    </>
                  }>
                    <Form.Control
                      type="text"
                      autoComplete="name"
                      placeholder="Name"
                      name='first_name'
                      value={data.first_name || ''}
                      onChange={handleDataChange}
                    />
                  </FloatingLabel>
                  <span className='text-red-500'>{error?.first_name}</span>
                </div>
                <div className="">
                  <FloatingLabel label={
                    <>
                      <span>Email <span className='text-red-500'>*</span></span>
                    </>
                  }>
                    <Form.Control
                      type="email"
                      autoComplete="email"
                      placeholder="Email"
                      name='email'
                      value={data.email || ''}
                      onChange={handleDataChange}
                    />
                  </FloatingLabel>
                  <span className='text-red-500'>{error?.email}</span>
                </div>
                <div className="">
                  <FloatingLabel label={
                    <>
                      <span>Number <span className='text-red-500'>*</span></span>
                    </>
                  }>
                    <Form.Control
                      type="number"
                      autoComplete="number"
                      placeholder="Phone Number"
                      name='number'
                      value={data.number || ''}
                      onInput={(e) => {
                        if (e.target.value.length > 10) {
                          e.target.value = e.target.value.slice(0, 10);
                        }
                      }}
                      onChange={handleDataChange}
                    />
                  </FloatingLabel>
                  <span className='text-red-500'>{error?.number}</span>
                </div>
              </div>
              <p className='text-wrap'>
                <span className="text-red-500">Note: </span>
                Password will be randomly generated & send to user via mail.
              </p>
            </div>
            <div className="flex justify-center gap-3 mt-4">
              <button 
                type="submit" 
                className="px-6 py-3 bg-gradient-to-r from-slate-600 to-gray-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <i className="fa-solid fa-user-plus"></i>
                Create User
              </button>
            </div>
          </Form>
        </div>
      </div>

      {/* ModalBox Component */}
      <ModalBox
        show={showModal}
        close={closeModal}
        header={"Confirmation"}
        body={`Do you want to create new user and send email to ${data?.email} about creation of user?`}
        btn={"Create"}
        confirmAction={
          userToAdd === 'management'
            ? handleSubmitManagement
            : userToAdd === 'tpo'
              ? handleSubmitTPO
              : userToAdd === 'student'
                ? handleSubmitStudent
                : ''
        }
      />
    </>
  );
}

export default AddNewUser;

