import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BASE_URL } from '../../config/backend_url';
import Toast from '../Toast';

function ViewBlog() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchBlog();
    fetchCurrentUser();
  }, [blogId]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/user/detail`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchBlog = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/blog/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlog(response.data.blog);
      setIsLiked(response.data.blog.likes?.includes(currentUser?.id));
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/blog/${blogId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsLiked(response.data.liked);
      fetchBlog(); // Refresh to get updated likes count
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${BASE_URL}/blog/${blogId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setToastMessage(response.data.msg || 'Blog deleted successfully');
        setShowToast(true);
        setTimeout(() => navigate('/student/blogs'), 1500);
      } catch (error) {
        console.error('Error deleting blog:', error);
        setToastMessage(error.response?.data?.msg || 'Error deleting blog');
        setShowToast(true);
      }
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Interview Experience': 'bg-blue-100 text-blue-700',
      'Resource Sharing': 'bg-green-100 text-green-700',
      'Tips & Tricks': 'bg-purple-100 text-purple-700',
      'Career Advice': 'bg-orange-100 text-orange-700',
      'Other': 'bg-gray-100 text-gray-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-indigo-600"></i>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <i className="fa-solid fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
        <p className="text-xl text-gray-700">Blog not found</p>
        <Link to="/student/blogs" className="mt-4 text-indigo-600 hover:underline">
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <>
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
      />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/student/blogs')}
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-4"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Back to Blogs
        </button>

        {/* Blog Content */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${getCategoryColor(blog.category).replace('text-', 'text-white bg-white/20')}`}>
                  <i className="fa-solid fa-tag"></i>
                  {blog.category}
                </span>
                <h1 className="text-3xl font-bold text-white mb-2">{blog.title}</h1>
                {blog.companyName && (
                  <div className="flex items-center gap-2 text-white/90">
                    <i className="fa-solid fa-building"></i>
                    <span className="font-medium">{blog.companyName}</span>
                  </div>
                )}
              </div>
              {currentUser?.id === blog.author._id && (
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
                  title="Delete Blog"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              )}
            </div>
          </div>

          {/* Author Info */}
          <div className="px-6 py-4 bg-indigo-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={blog.author?.profile || '/default-avatar.png'}
                  alt={blog.authorName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200"
                />
                <div>
                  <p className="font-semibold text-gray-800">{blog.authorName}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(blog.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all font-semibold ${
                  isLiked
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart text-lg`}></i>
                <span>{blog.likesCount || 0}</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                {blog.content}
              </p>
            </div>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 font-medium">Tags:</span>
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold"
                  >
                    <i className="fa-solid fa-hashtag text-xs"></i>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ViewBlog;
