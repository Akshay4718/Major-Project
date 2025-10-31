import {useEffect, useState } from "react";
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Toast from './Toast';
import ModalBox from './Modal';
import { BASE_URL } from '../config/backend_url';


function ViewJobPost() {
  document.title = 'CPMS | View Job Post';
  const { jobId } = useParams();

  const [data, setData] = useState({});
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // useState for toast display
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');


  // useState for load data
  const [currentUser, setCurrentUser] = useState({});


  // check applied to a job
  const [applied, setApplied] = useState(false);

  const [applicant, setApplicant] = useState([]);

  // check applied to a job
  const fetchApplied = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/student/check-applied/${jobId}/${currentUser.id}`);
      // console.log(response.data);
      if (response?.data?.applied) {
        setApplied(response?.data?.applied)
      }
    } catch (error) {
      if (error?.response?.data?.msg) {
        setToastMessage(response?.data?.msg);
        setShowToast(true);
      }
      console.log("error while fetching student applied or not => ", error);
    }
  }

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
  }, []);

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
    }
  }

  const fetchCompanyData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/company/company-data?companyId=${data.company}`);
      setCompany(response.data.company);
    } catch (error) {
      console.log("AddCompany error while fetching => ", error);
    }
  }

  // handle apply and its modal
  const [showModal, setShowModal] = useState(false);
  const [modalBody, setModalBody] = useState();

  const closeModal = () => {
    setShowModal(false);
  };

  const handleApply = () => {
    setModalBody("Do you really want to apply this job? Make sure your profile is updated to lastest that increase placement chances.");
    setShowModal(true);
    // console.log(currentUser)
  }

  const handleConfirmApply = async () => {
    try {
      const response = await axios.put(`${BASE_URL}/student/job/${jobId}/${currentUser.id}`);
      // console.log(response.data);
      if (response?.data?.msg) {
        setToastMessage(response?.data?.msg);
        setShowToast(true);
      }
      setShowModal(false);
      fetchApplied();
      // setCompany(response.data.company);
    } catch (error) {
      setShowModal(false);
      if (error?.response?.data?.msg) {
        setToastMessage(error?.response?.data?.msg);
        setShowToast(true);
      }
      console.log("error while fetching apply to job => ", error);
    }
  }

  const fetchApplicant = async () => {
    if (!jobId || currentUser?.role === 'student') return;
    await axios.get(`${BASE_URL}/tpo/job/applicants/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        if (res?.data?.msg) setToastMessage(res.data.msg)
        else setApplicant(res?.data?.applicantsList);
      })
      .catch(err => {
        console.log(err);
        if (err?.response?.data?.msg) setToastMessage(err.response.data.msg)
      })
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchApplied();
        if (data?.company) {
          await fetchCompanyData();
        }
        if (currentUser.id) {
          await fetchJobDetail();
        }
        if (jobId)
          await fetchApplicant();
      } catch (error) {
        console.error("Error during fetching and applying job:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [currentUser, data?.company, jobId]);



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
            <i className="fa-solid fa-spinner fa-spin text-4xl text-indigo-600" />
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-white rounded-xl shadow-xl p-8 mb-6  ">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-2">{data?.jobTitle}</h1>
                  <div className="flex items-center gap-3 text-lg">
                    <span className="flex items-center gap-2">
                      <i className="fa-solid fa-building"></i>
                      {company?.companyName}
                    </span>
                    {company?.companyLocation && (
                      <span className="flex items-center gap-2">
                        <i className="fa-solid fa-location-dot"></i>
                        {company?.companyLocation?.split(',')[0]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-1">₹{data?.salary} LPA</div>
                  <div className="text-sm opacity-90">Annual CTC</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 my-6 text-base max-sm:text-sm max-lg:grid-cols-1">
              {/* Left Column - Company Details */}
              <div className="flex flex-col gap-6">
                {/* Company Details Card */}
                <div className="bg-white/90 border-2 border-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <i className="fa-solid fa-building text-blue-600 text-2xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Company Details</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">{company?.companyName}</h4>
                      <p className="text-gray-600 leading-relaxed text-justify">{company?.companyDescription}</p>
                    </div>
                    
                    {company?.companyWebsite && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold text-gray-700 flex items-center gap-2">
                          <i className="fa-solid fa-globe text-blue-600"></i>
                          Website
                        </span>
                        <a
                          href={company?.companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium no-underline flex items-center gap-1"
                        >
                          Visit <i className="fa-solid fa-arrow-up-right-from-square text-sm"></i>
                        </a>
                      </div>
                    )}
                    
                    {company?.companyLocation && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <i className="fa-solid fa-map-marker-alt text-green-600"></i>
                          Job Locations
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {company?.companyLocation?.split(',').map((location, index) => (
                            <span key={index} className='bg-green-100 text-green-700 py-1 px-3 rounded-full text-sm font-medium'>
                              {location.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {company?.companyDifficulty && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold text-gray-700 flex items-center gap-2">
                          <i className="fa-solid fa-signal text-purple-600"></i>
                          Difficulty Level
                        </span>
                        <span className={`py-1 px-4 rounded-full text-sm font-semibold ${
                          company?.companyDifficulty === "Easy" ? 'bg-green-100 text-green-700' :
                          company?.companyDifficulty === "Moderate" ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {company?.companyDifficulty}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {
                  currentUser.role !== "student" && (
                    <div className="space-y-4">
                      {/* Manage Applicants Button for TPO */}
                      {(currentUser.role === 'tpo_admin' || currentUser.role === 'management_admin') && applicant?.length > 0 && (
                        <div>
                            <Link 
                              to={`/tpo/manage-applicants/${jobId}`}
                              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors no-underline shadow-md"
                            >
                              <i className="fa-solid fa-users-gear"></i>
                              <span className="font-semibold">Manage Applicants & Status</span>
                              <span className="bg-white text-indigo-600 px-2 py-1 rounded-full text-sm font-bold">{applicant.length}</span>
                            </Link>
                          </div>
                        )}
                        
                        {/* Applicants applied */}
                        <div className="bg-white/90 border-2 border-indigo-200 rounded-xl shadow-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-indigo-100 rounded-full">
                              <i className="fa-solid fa-users text-indigo-600 text-2xl"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Applicants Applied</h3>
                          </div>
                          <div className="overflow-x-auto">
                            <Table striped hover size='sm' className='text-center'>
                                <thead>
                                  <tr>
                                    <th style={{ width: '10%' }}>#</th>
                                    <th style={{ width: '20%' }}>Name</th>
                                    <th style={{ width: '15%' }}>Email</th>
                                    <th style={{ width: '20%' }}>Current Round</th>
                                    <th style={{ width: '15%' }}>Status</th>
                                    <th style={{ width: '20%' }}>Applied On</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {
                                    applicant?.length > 0 ? (
                                      <>
                                        {
                                          applicant.map((app, index) => (
                                            <tr key={index}>
                                              <td>{index + 1}</td>
                                              <td>
                                                {
                                                  (currentUser.role === 'tpo_admin' ||
                                                    currentUser.role === 'management_admin' ||
                                                    currentUser.role === 'superuser') && (
                                                    <Link
                                                      to={
                                                        currentUser.role === 'tpo_admin'
                                                          ? `/tpo/user/${app.id}`
                                                          : currentUser.role === 'management_admin'
                                                            ? `/management/user/${app.id}`
                                                            : currentUser.role === 'superuser'
                                                              ? `/admin/user/${app.id}`
                                                              : '#'
                                                      }
                                                      target='_blank'
                                                      className='text-blue-500 no-underline hover:text-blue-700'
                                                    >
                                                      {app.name}
                                                    </Link>
                                                  )
                                                }
                                              </td>
                                              <td>{app.email}</td>
                                              <td>{(app?.currentRound?.charAt(0)?.toUpperCase() + app?.currentRound?.slice(1)) || '-'}</td>
                                              <td>{app.applicationStatus ? (app.applicationStatus.charAt(0).toUpperCase() + app.applicationStatus.slice(1)) : (app.status ? (app.status.charAt(0).toUpperCase() + app.status.slice(1)) : 'Applied')}</td>
                                              <td>{new Date(app.appliedAt).toLocaleString('en-IN')}</td>
                                            </tr>
                                          ))
                                        }
                                      </>
                                    ) : (
                                      <tr>
                                        <td colSpan={6}>No Student Yet Applied!</td>
                                      </tr>
                                    )
                                  }
                                </tbody>
                              </Table>
                            </div>
                          </div>
                    </div>
                  )
                }

              </div>


              {/* Middle Column - Job Details */}
              <div className="col-span-2 max-lg:col-span-1">
                <div className="bg-white/90 border-2 border-purple-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <i className="fa-solid fa-briefcase text-purple-600 text-2xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Job Details</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Job Description */}
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-600">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-file-lines text-purple-600"></i>
                        Job Profile
                      </h4>
                      <div className='text-gray-700 leading-relaxed' dangerouslySetInnerHTML={{ __html: data?.jobDescription }} />
                    </div>
                    
                    {/* Eligibility */}
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-l-4 border-blue-600">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-clipboard-check text-blue-600"></i>
                        Eligibility Criteria
                      </h4>
                      <div className='text-gray-700 leading-relaxed' dangerouslySetInnerHTML={{ __html: data?.eligibility }} />
                    </div>
                    
                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-600">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="fa-solid fa-money-bill-wave text-green-600 text-xl"></i>
                          <span className="font-semibold text-gray-700">Package</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">₹{data?.salary} LPA</div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-l-4 border-red-600">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="fa-solid fa-calendar-xmark text-red-600 text-xl"></i>
                          <span className="font-semibold text-gray-700">Deadline</span>
                        </div>
                        <div className="text-lg font-bold text-red-600">
                          {new Date(data?.applicationDeadline).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {/* How to Apply */}
                    {
                      (applied === true || currentUser?.role !== 'student') && (
                        <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border-l-4 border-yellow-600">
                          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-circle-info text-yellow-600"></i>
                            How to Apply?
                          </h4>
                          <div className='text-gray-700 leading-relaxed' dangerouslySetInnerHTML={{ __html: data?.howToApply }} />
                        </div>
                      )
                    }
                        {
                          currentUser.role === 'student' && (
                            <div className="flex justify-center py-4">
                              {
                                (() => {
                                  // Check if deadline has passed
                                  const isDeadlinePassed = data?.applicationDeadline && new Date() > new Date(data.applicationDeadline);
                                  
                                  if (applied === true) {
                                    return (
                                      <div className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg shadow-lg flex items-center gap-2">
                                        <i className="fa-solid fa-circle-check"></i>
                                        Already Applied
                                      </div>
                                    );
                                  }
                                  
                                  if (isDeadlinePassed) {
                                    return (
                                      <div className="flex flex-col items-center gap-2">
                                        <div className="px-8 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold rounded-lg shadow-lg flex items-center gap-2 cursor-not-allowed opacity-75">
                                          <i className="fa-solid fa-lock"></i>
                                          Application Closed
                                        </div>
                                        <p className="text-sm text-red-600">Deadline has passed</p>
                                      </div>
                                    );
                                  }
                                  
                                  return (
                                    <button 
                                      onClick={handleApply}
                                      className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
                                    >
                                      <i className="fa-solid fa-paper-plane"></i>
                                      Apply Now
                                    </button>
                                  );
                                })()
                              }
                            </div>
                          )
                        }
                      </div>
                    </div>
                  </div>

            </div>
          </>
        )
      }


      {/* ModalBox Component for Delete Confirmation */}
      <ModalBox
        show={showModal}
        close={closeModal}
        header={"Confirmation"}
        body={modalBody}
        btn={"Apply"}
        confirmAction={handleConfirmApply}
      />

    </>
  )
}

export default ViewJobPost

