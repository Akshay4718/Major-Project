import {useEffect, useState } from "react";
import { OverlayTrigger, Tooltip, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Badge from 'react-bootstrap/Badge';
import TablePlaceholder from '../components/TablePlaceholder';
import Toast from '../components/Toast';
import ModalBox from '../components/Modal';
import { BASE_URL } from '../config/backend_url';


function ViewlAllNotice() {
  document.title = 'CPMS | Notices';
  const [loading, setLoading] = useState(true);
  const [noticesData, setNoticesData] = useState([]);
  const [currentUser, setCurrentUser] = useState({});

  // useState for toast display
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // useState for Modal display
  const [showModal, setShowModal] = useState(false);
  const [modalToPass, setModalToPass] = useState('');

  const closeModal = () => setShowModal(false);

  const renderTooltipDelete = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Delete Notice
    </Tooltip>
  );

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/user/detail`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setCurrentUser({ role: response.data.role });
      } catch (error) {
        console.log("Error fetching user details => ", error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser?.role) {
      fetchNotices();
    }
  }, [currentUser?.role]);

  const handleDelete = async (noticeId) => {
    setModalToPass(noticeId);
    setShowModal(true);
  };

  const confirmDelete = async (noticeId) => {
    try {
      const response = await axios.post(`${BASE_URL}/management/delete-notice?noticeId=${noticeId}`);
      if (response?.data?.msg) {
        fetchNotices();
        setToastMessage(response.data.msg);
        setShowToast(true);
      }
    } catch (error) {
      console.log('Error while deleting notice => ', error);
    }
    setShowModal(false);
  };

  const fetchNotices = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/management/get-all-notices`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });

      if (currentUser?.role === 'tpo_admin') {
        const filteredNotices = response?.data?.filter(notice => (
          notice.sender_role === 'tpo_admin' || notice.receiver_role === 'tpo_admin'
        ));
        setNoticesData(filteredNotices);
      } else if (currentUser?.role === 'student') {
        const filteredNotices = response?.data?.filter(notice => notice.receiver_role === 'student');
        setNoticesData(filteredNotices);
      } else {
        setNoticesData(response.data);
      }
    } catch (error) {
      console.log('Error while fetching notices => ', error);
    } finally {
      setLoading(false);
    }
  };


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
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '5%' }}>#</th>
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '20%' }}>Title</th>
                  {
                    currentUser?.role !== 'student' && (
                      <>
                        <th className="px-4 py-3 text-sm font-semibold" style={{ width: '12%' }}>Sender</th>
                        <th className="px-4 py-3 text-sm font-semibold" style={{ width: '12%' }}>Receiver</th>
                      </>
                    )
                  }
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '35%' }}>Message</th>
                  <th className="px-4 py-3 text-sm font-semibold" style={{ width: '16%' }}>Posted</th>
                  {
                    currentUser?.role !== 'student' && (
                      <th className="px-4 py-3 text-sm font-semibold text-center" style={{ width: '10%' }}>Action</th>
                    )
                  }
                </tr>
              </thead>
              <tbody className="bg-white">
                {noticesData?.length > 0 ? (
                  noticesData?.map((notice, index) => (
                    <tr key={notice?._id} className="border-b border-gray-100 hover:bg-indigo-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3 text-sm">
                        <Link
                          to={
                            currentUser?.role === 'student'
                              ? `/student/notice/${notice?._id}`
                              : currentUser?.role === 'tpo_admin'
                                ? `/tpo/notice/${notice?._id}`
                                : currentUser.role === 'management_admin'
                                  ? `/management/notice/${notice?._id}`
                                  : ''
                          }
                          className='no-underline text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2'
                        >
                          <i className="fa-solid fa-bell text-xs"></i>
                          {notice?.title}
                          {(new Date() - new Date(notice?.createdAt)) / (1000 * 60 * 60 * 24) <= 2 && (
                            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                              NEW
                            </span>
                          )}
                        </Link>
                      </td>
                      {
                        currentUser?.role !== 'student' && (
                          <>
                            <td className="px-4 py-3 text-sm">
                              {notice?.sender_role === 'management_admin' && (
                                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                                  <i className="fa-solid fa-user-tie"></i>
                                  Management
                                </span>
                              )}
                              {notice?.sender_role === 'tpo_admin' && (
                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                  <i className="fa-solid fa-user-shield"></i>
                                  TPO
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {notice?.receiver_role === 'tpo_admin' && (
                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                  <i className="fa-solid fa-user-shield"></i>
                                  TPO
                                </span>
                              )}
                              {notice?.receiver_role === 'student' && (
                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                  <i className="fa-solid fa-user-graduate"></i>
                                  Student
                                </span>
                              )}
                            </td>
                          </>
                        )
                      }
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-start gap-1">
                          <i className="fa-solid fa-message text-xs text-gray-400 mt-1"></i>
                          <span className="line-clamp-2">{notice?.message}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <i className="fa-regular fa-calendar text-xs text-gray-400"></i>
                            {new Date(notice.createdAt).toLocaleDateString('en-IN')}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <i className="fa-regular fa-clock text-xs"></i>
                            {new Date(notice.createdAt).toLocaleTimeString('en-IN')}
                          </div>
                        </div>
                      </td>
                      {
                        currentUser?.role !== 'student' && (
                          ((currentUser?.role === 'tpo_admin' && notice?.sender_role !== 'management_admin') || currentUser?.role === 'management_admin') ? (
                            <td className="px-4 py-3 text-sm">
                              <div className="flex justify-center items-center">
                                <OverlayTrigger
                                  placement="top"
                                  delay={{ show: 250, hide: 400 }}
                                  overlay={renderTooltipDelete}
                                >
                                  <button
                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                                    onClick={() => handleDelete(notice._id)}
                                  >
                                    <i className="fa-solid fa-trash-can text-base"></i>
                                  </button>
                                </OverlayTrigger>
                              </div>
                            </td>
                          ) : (
                            <td className='px-4 py-3 text-center text-gray-400'>
                              <i className="fa-solid fa-minus"></i>
                            </td>
                          )
                        )
                      }
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <i className="fa-solid fa-bell-slash text-4xl text-gray-300"></i>
                        <p className="mb-0 font-medium">No Notices Found!</p>
                        <p className="text-xs text-gray-400">Check back later for new announcements</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )
      }


      {/* ModalBox Component for Delete Confirmation */}
      <ModalBox
        show={showModal}
        close={closeModal}
        header={"Confirmation"}
        body={`Want to delete notice?`}
        btn={"Delete"}
        confirmAction={() => confirmDelete(modalToPass)}
      />
    </>
  )
}

export default ViewlAllNotice

