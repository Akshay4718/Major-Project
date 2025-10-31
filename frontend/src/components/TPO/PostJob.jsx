import {useState, useRef, useEffect } from "react";
import JoditEditor from 'jodit-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel'; ``
import Form from 'react-bootstrap/Form';
import Toast from '../Toast';
import ModalBox from '../Modal';
import { BASE_URL } from '../../config/backend_url';

function PostJob() {
  document.title = 'CPMS | Post Job';
  const navigate = useNavigate();

  const { jobId } = useParams();
  const editor = useRef(null);

  const [data, setData] = useState({});
  const [companys, setCompanys] = useState(null);

  const [loading, setLoading] = useState(true);

  // useState for toast display
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // useState for Modal display
  const [showModal, setShowModal] = useState(false);

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data?.company || !data?.jobTitle || !data?.salary || !data?.applicationDeadline || !data?.jobDescription || !data?.eligibility || !data?.howToApply || !data?.jobCategory) {
      setToastMessage("All Fields Required!");
      setShowToast(true);
      return;
    }
    console.log('📋 Job Data before submission:', data);
    console.log('🏷️ Job Category:', data.jobCategory);
    setShowModal(true);
  }

  const confirmSubmit = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/tpo/post-job`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      )

      // console.log(response.data)
      if (response?.data?.msg) {
        setToastMessage(response.data.msg);
        setShowToast(true);

        const newDataToPass = {
          showToastPass: true,
          toastMessagePass: response?.data?.msg,
        };
        navigate('../tpo/job-listings', { state: newDataToPass });
      }
    } catch (error) {
      if (error.response) {
        if (error?.response.data?.msg) setToastMessage(error.response.data.msg)
        else setToastMessage(error.message)

        setShowToast(true);
      }
      console.log("PostJob error while fetching => ", error);
    }
  }

  const handleDataChange = (e) => {
    const updatedData = { ...data, [e.target.name]: e.target.value };
    if (e.target.name === 'jobCategory') {
      console.log('Job Category selected:', e.target.value);
    }
    setData(updatedData);
  }

  const fetchJobDetail = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/tpo/job/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      )
      setData(response.data);
    } catch (error) {
      if (error.response) {
        if (error?.response.data?.msg) setToastMessage(error.response.data.msg)
        else setToastMessage(error.message)
        setShowToast(true);

        if (error?.response?.data?.msg === "job data not found") navigate('../404');
      }
      console.log("Error while fetching details => ", error);
    } finally {
      setLoading(false);
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
    } catch (error) {
      console.log("Error fetching jobs ", error);
      if (error?.response?.data?.msg) {
        setToastMessage(error.response.data.msg);
        setShowToast(true);
      }
    }
  }

  useEffect(() => {
    // calling fetchJobDetail
    fetchJobDetail();
    fetchCompanys();
    if (!jobId) setLoading(false);
  }, []);

  // for formating date of birth
  const formatDate = (isoString) => {
    if (!isoString || isoString === "undefined") return "";
    const date = new Date(isoString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  // for formatting datetime for datetime-local input
  const formatDateTime = (isoString) => {
    if (!isoString || isoString === "undefined") return "";
    const date = new Date(isoString);
    // Format to YYYY-MM-DDTHH:mm for datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <>
      {/*  any message here  */}
      < Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
        position="bottom-end"
      />

      {
        loading ? (
          <div className="flex justify-center h-72 items-center">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-slate-500" />
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-slate-700 text-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <i className="fa-solid fa-briefcase text-3xl"></i>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Post New Job</h1>
                  <p className="text-slate-100 text-sm mt-1">Create a new job posting for students</p>
                </div>
              </div>
            </div>

            <div className="">
              <form onSubmit={handleSubmit}>
                {/* Company Selection Card */}
                <div className="bg-white/95 border-2 border-slate-200 rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <i className="fa-solid fa-building text-slate-600 text-xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Select Company</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {/* company details  */}
                    <FloatingLabel controlId="floatingSelectDifficulty" label={
                      <>
                        <span>Select Company Name <span className='text-red-500'>*</span></span>
                      </>
                    }>
                      <Form.Select
                        aria-label="Floating label select difficulty"
                        className='cursor-pointer'
                        name='companySelected'
                        value={data?.company || ''}
                        onChange={(e) => {
                          setData({
                            ...data,
                            company: e.target.value
                          });
                        }}

                      >
                        <option disabled value='' className='text-gray-400'>Select Company Name</option>
                        {
                          companys?.map((company, index) => (
                            <option key={index} value={company._id}>{company.companyName}</option>
                          ))
                        }
                      </Form.Select>
                    </FloatingLabel>
                  </div>
                </div>

                {/* Job Details Card */}
                <div className="bg-white/95 border-2 border-slate-200 rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <i className="fa-solid fa-file-lines text-slate-600 text-xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Job Details</h3>
                  </div>
                  <div className="flex flex-col">
                    {/* job details  */}
                    <div className="grid grid-cols-3 gap-2 max-md:grid-cols-1">
                      <FloatingLabel controlId="floatingJobTitle" label={
                        <>
                          <span>Job Title <span className='text-red-500'>*</span></span>
                        </>
                      }>
                        <Form.Control
                          type="text"
                          placeholder="Job Title"
                          name='jobTitle'
                          value={data?.jobTitle || ''}
                          onChange={handleDataChange}

                        />
                      </FloatingLabel>

                      <FloatingLabel controlId="floatingSalary" label={
                        <>
                          <span>Salary (In LPA) <span className='text-red-500'>*</span></span>
                        </>
                      }>
                        <Form.Control
                          type="text"
                          placeholder="Salary"
                          name="salary"
                          value={data?.salary || ''}
                          onChange={(e) => {
                            // Allow only numbers and decimals
                            if (!isNaN(e.target.value) && /^[0-9]*[.,]?[0-9]*$/.test(e.target.value)) {
                              handleDataChange(e);
                            }
                          }}

                        />
                      </FloatingLabel>

                      <FloatingLabel controlId="floatingDeadlineDate" label={
                        <>
                          <span>Deadline Date & Time <span className='text-red-500'>*</span></span>
                        </>
                      }>
                        <Form.Control
                          type="datetime-local"
                          placeholder="Deadline Date & Time"
                          name='applicationDeadline'
                          value={formatDateTime(data?.applicationDeadline) || ''}
                          onChange={handleDataChange}

                        />
                      </FloatingLabel>
                    </div>

                    {/* Job Category and Internship Options */}
                    <div className="grid grid-cols-3 gap-2 max-md:grid-cols-1 mt-3">
                      <FloatingLabel controlId="floatingJobCategory" label={
                        <>
                          <span>Job Category <span className='text-red-500'>*</span></span>
                        </>
                      }>
                        <Form.Select
                          aria-label="Select job category"
                          className='cursor-pointer'
                          name='jobCategory'
                          value={data?.jobCategory || ''}
                          onChange={handleDataChange}
                        >
                          <option disabled value=''>Select Category</option>
                          <option value='mass'>Mass (Generic hiring)</option>
                          <option value='core'>Core (Branch specific)</option>
                          <option value='dream'>Dream (&gt;8 LPA / Top 500)</option>
                          <option value='open_dream'>Open Dream (&gt;20 LPA)</option>
                        </Form.Select>
                      </FloatingLabel>

                      <div className="flex items-center gap-4 px-3">
                        <Form.Check
                          type="checkbox"
                          label="Internship"
                          name="isInternship"
                          checked={data?.isInternship || false}
                          onChange={(e) => setData({ ...data, isInternship: e.target.checked })}
                        />
                        {data?.isInternship && (
                          <Form.Check
                            type="checkbox"
                            label="Has Conversion"
                            name="hasConversionOption"
                            checked={data?.hasConversionOption || false}
                            onChange={(e) => setData({ ...data, hasConversionOption: e.target.checked })}
                          />
                        )}
                      </div>
                    </div>

                    {/* Eligibility Criteria Section */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center gap-2 mb-4">
                        <i className="fa-solid fa-graduation-cap text-blue-600 text-xl"></i>
                        <h4 className="text-lg font-bold text-slate-800">Eligibility Criteria (Optional)</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Set minimum academic requirements. Leave blank if no specific criteria.</p>
                      
                      <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
                        <FloatingLabel controlId="floatingSslc" label="SSLC Percentage (10th)">
                          <Form.Control
                            type="number"
                            placeholder="SSLC %"
                            name="sslcPercentage"
                            min="0"
                            max="100"
                            step="0.01"
                            value={data?.eligibilityCriteria?.sslcPercentage || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                                setData({
                                  ...data,
                                  eligibilityCriteria: {
                                    ...data?.eligibilityCriteria,
                                    sslcPercentage: value === '' ? undefined : parseFloat(value)
                                  }
                                });
                              }
                            }}
                          />
                        </FloatingLabel>

                        <FloatingLabel controlId="floatingPuc" label="PUC Percentage (12th)">
                          <Form.Control
                            type="number"
                            placeholder="PUC %"
                            name="pucPercentage"
                            min="0"
                            max="100"
                            step="0.01"
                            value={data?.eligibilityCriteria?.pucPercentage || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                                setData({
                                  ...data,
                                  eligibilityCriteria: {
                                    ...data?.eligibilityCriteria,
                                    pucPercentage: value === '' ? undefined : parseFloat(value)
                                  }
                                });
                              }
                            }}
                          />
                        </FloatingLabel>

                        <FloatingLabel controlId="floatingCgpa" label="Degree CGPA">
                          <Form.Control
                            type="number"
                            placeholder="CGPA"
                            name="degreeCgpa"
                            min="0"
                            max="10"
                            step="0.01"
                            value={data?.eligibilityCriteria?.degreeCgpa || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 10)) {
                                setData({
                                  ...data,
                                  eligibilityCriteria: {
                                    ...data?.eligibilityCriteria,
                                    degreeCgpa: value === '' ? undefined : parseFloat(value)
                                  }
                                });
                              }
                            }}
                          />
                        </FloatingLabel>
                      </div>
                    </div>

                    {/* text editor  */}
                    <div className="py-6">
                      <label className=''>
                        Enter Job Description <span className="text-red-500">*</span>
                      </label>
                      <JoditEditor
                        ref={editor}
                        tabIndex={1}
                        value={data?.jobDescription || ''}
                        onChange={(e) => {
                          setData({
                            ...data,
                            jobDescription: e
                          })
                        }}
                      />
                    </div>
                    <div className="py-6">
                      <label className=''>
                        Enter Eligibility <span className="text-red-500">*</span>
                      </label>
                      <JoditEditor
                        ref={editor}
                        tabIndex={2}
                        value={data?.eligibility || ''}
                        onChange={(e) => {
                          setData({
                            ...data,
                            eligibility: e
                          })
                        }}
                      />
                    </div>
                    <div className="py-6">
                      <label className=''>
                        Enter Process To Apply <span className="text-red-500">*</span>
                      </label>
                      <JoditEditor
                        ref={editor}
                        tabIndex={3}
                        value={data?.howToApply || ''}
                        onChange={(e) => {
                          setData({
                            ...data,
                            howToApply: e
                          })
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-center items-center gap-4 mt-6">
                  <button 
                    type='submit'
                    className="px-8 py-3 bg-gradient-to-r from-slate-600 to-gray-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                    Post Job
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
              </form>
            </div>
          </>
        )
      }

      {/* ModalBox Component for Delete Confirmation */}
      <ModalBox
        show={showModal}
        close={closeModal}
        header={"Confirmation"}
        body={`Do you want to post job for ${data?.jobTitle}?`}
        btn={"Post"}
        confirmAction={confirmSubmit}
      />
    </>
  )
}
export default PostJob

