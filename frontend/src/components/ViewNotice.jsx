import axios from 'axios';
import {useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_URL } from '../config/backend_url';

function ViewNotice() {
  document.title = 'CPMS | Notice';
  const navigate = useNavigate();
  const { noticeId } = useParams();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNotice = async () => {
    try {
      if (!noticeId) return;
      const response = await axios.get(`${BASE_URL}/management/get-notice?noticeId=${noticeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log("Notice data:", response?.data);
      setNotice(response?.data);
    } catch (error) {
      console.log("error while fetching notice => ", error);
      setNotice(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotice();
  }, [noticeId]);

  // Loading state
  if (loading) {
    return (
      <div className="my-6 mx-auto max-w-4xl">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center justify-center gap-3">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-indigo-600"></i>
            <p className="text-gray-500">Loading notice...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - notice not found
  if (!notice || !notice.title) {
    return (
      <div className="my-6 mx-auto max-w-4xl">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center justify-center gap-3">
            <i className="fa-solid fa-exclamation-triangle text-4xl text-red-500"></i>
            <p className="text-gray-700 font-semibold">Notice not found</p>
            <p className="text-gray-500 text-sm">The notice you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="my-6 mx-auto max-w-4xl">
        {/* Notice Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-lg px-6 py-4 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <i className="fa-solid fa-bell text-white text-2xl"></i>
            <h1 className="text-2xl font-bold text-white mb-0">Notice</h1>
          </div>
        </div>

        {/* Notice Content */}
        <div className="bg-white border border-gray-200 rounded-b-lg shadow-lg">
          {/* Title */}
          <div className="border-b border-gray-200 px-6 py-4 bg-indigo-50">
            <h2 className="text-xl font-bold text-gray-800 mb-0 flex items-start gap-2">
              <i className="fa-solid fa-file-lines text-indigo-600 mt-1"></i>
              {notice.title}
            </h2>
          </div>

          {/* Message Content */}
          <div className="px-6 py-6">
            <div className="flex items-start gap-2 mb-4">
              <i className="fa-solid fa-message text-indigo-600 mt-1"></i>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Message:</h3>
                <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                  {notice.message || 'No message content available'}
                </p>
              </div>
            </div>
          </div>

          {/* Date and Time Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              {notice.createdAt ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <i className="fa-regular fa-calendar text-indigo-600"></i>
                      <span className="font-medium">Posted on:</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(notice.createdAt).toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <i className="fa-regular fa-clock text-indigo-600"></i>
                      <span className="font-medium">at</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(notice.createdAt).toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {/* NEW badge if posted within 2 days */}
                  {(new Date() - new Date(notice.createdAt)) / (1000 * 60 * 60 * 24) <= 2 && (
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                      <i className="fa-solid fa-star"></i>
                      NEW
                    </span>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-500">
                  <i className="fa-regular fa-calendar-xmark text-gray-400 mr-2"></i>
                  Date not available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ViewNotice

