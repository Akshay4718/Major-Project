import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../config/backend_url';
import Toast from '../Toast';

function CreateBlog() {
  document.title = 'CPMS | Create Blog';
  
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Interview Experience',
    companyName: '',
    tags: ''
  });

  const categories = ['Interview Experience', 'Resource Sharing', 'Tips & Tricks', 'Career Advice', 'Other'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [];
      
      const response = await axios.post(`${BASE_URL}/blog/create`, {
        ...formData,
        tags: tagsArray
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setToastMessage(response.data.msg || 'Blog created successfully!');
      setShowToast(true);
      
      setTimeout(() => {
        navigate('/student/blogs');
      }, 1500);
    } catch (error) {
      console.error('Error creating blog:', error);
      setToastMessage(error.response?.data?.msg || 'Error creating blog');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
      />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/student/blogs')}
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-4"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Back to Blogs
          </button>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <i className="fa-solid fa-pen-to-square text-indigo-600"></i>
            Create New Blog
          </h1>
          <p className="text-gray-600 mt-1">Share your knowledge and experiences with fellow students</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fa-solid fa-heading text-indigo-600 mr-2"></i>
              Blog Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter an eye-catching title..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fa-solid fa-tag text-indigo-600 mr-2"></i>
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Company Name (Optional) */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fa-solid fa-building text-indigo-600 mr-2"></i>
              Company Name (Optional)
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g., Google, Amazon..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">For interview experiences, mention the company name</p>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fa-solid fa-align-left text-indigo-600 mr-2"></i>
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows="12"
              placeholder="Write your blog content here... Share detailed information, tips, and insights."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fa-solid fa-tags text-indigo-600 mr-2"></i>
              Tags (Optional)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., coding, interview, tips (comma separated)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Publishing...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i>
                  Publish Blog
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/student/blogs')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default CreateBlog;
