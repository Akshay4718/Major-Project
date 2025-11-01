import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config/backend_url';
import { FaVideo, FaCalendarAlt, FaClock, FaPlus, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';

function OnlineMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [currentMeetingLink, setCurrentMeetingLink] = useState('');
  const [currentMeetingTitle, setCurrentMeetingTitle] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledTime: '',
    duration: 60
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/meeting/tpo/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setMeetings(response.data.meetings);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      
      // Convert local datetime to ISO string (with timezone)
      const localDateTime = new Date(formData.scheduledTime);
      const dataToSend = {
        ...formData,
        scheduledTime: localDateTime.toISOString()
      };
      
      const response = await axios.post(
        `${BASE_URL}/meeting/create`,
        dataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Meeting created! Email invitations sent to all students.' });
        setShowModal(false);
        setFormData({ title: '', description: '', scheduledTime: '', duration: 60 });
        fetchMeetings();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create meeting' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this meeting?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/meeting/tpo/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Meeting deleted' });
      fetchMeetings();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete meeting' });
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata'
    });
  };

  const handleStartMeeting = (meetingLink, meetingTitle) => {
    setCurrentMeetingLink(meetingLink);
    setCurrentMeetingTitle(meetingTitle);
    setShowMeetingModal(true);
  };

  const handleCloseMeeting = () => {
    setShowMeetingModal(false);
    setCurrentMeetingLink('');
    setCurrentMeetingTitle('');
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">
          <FaVideo className="me-2 text-primary" />
          Online Meetings
        </h3>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <FaPlus className="me-2" />
          Schedule Meeting
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Meetings List */}
      <div className="row g-3">
        {meetings.length === 0 ? (
          <div className="col-12">
            <div className="card text-center py-5">
              <div className="card-body">
                <FaVideo size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No meetings scheduled</h5>
                <p className="text-muted">Click 'Schedule Meeting' to create your first meeting</p>
              </div>
            </div>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div key={meeting._id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{meeting.title}</h5>
                  <p className="card-text text-muted small">{meeting.description}</p>
                  
                  <div className="mb-2">
                    <FaCalendarAlt className="me-2 text-primary" />
                    <small>{formatDateTime(meeting.scheduledTime)}</small>
                  </div>
                  
                  <div className="mb-3">
                    <FaClock className="me-2 text-primary" />
                    <small>{meeting.duration} minutes</small>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleStartMeeting(meeting.meetingLink, meeting.title)}
                      className="btn btn-sm btn-success flex-grow-1"
                    >
                      <FaVideo className="me-1" />
                      Start
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(meeting._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Schedule Meeting</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                      min={new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Duration (minutes) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      min="15"
                      max="480"
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Meeting'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Modal */}
      {showMeetingModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content" style={{ backgroundColor: '#1a1a1a' }}>
              <div className="modal-header border-0" style={{ backgroundColor: '#2d2d2d' }}>
                <h5 className="modal-title text-white">
                  <FaVideo className="me-2" />
                  {currentMeetingTitle}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={handleCloseMeeting}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-0" style={{ height: '70vh' }}>
                <iframe
                  src={currentMeetingLink}
                  title={currentMeetingTitle}
                  className="w-100 h-100"
                  style={{ border: 'none' }}
                  allow="camera; microphone; fullscreen; speaker; display-capture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OnlineMeetings;
