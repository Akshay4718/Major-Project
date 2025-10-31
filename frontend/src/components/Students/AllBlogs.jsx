import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../config/backend_url';

function AllBlogs() {
  document.title = 'CPMS | Student Blogs';
  
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const categories = ['All', 'Interview Experience', 'Resource Sharing', 'Tips & Tricks', 'Career Advice', 'Other'];

  useEffect(() => {
    fetchCurrentUser();
    fetchBlogs();
  }, [selectedCategory, searchTerm]);

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

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const response = await axios.get(`${BASE_URL}/blog/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setBlogs(response.data.blogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (blogId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/blog/${blogId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBlogs(); // Refresh blogs
    } catch (error) {
      console.error('Error liking blog:', error);
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

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-indigo-600"></i>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <i className="fa-solid fa-blog text-indigo-600"></i>
            Student Blogs
          </h1>
          <p className="text-gray-600 mt-1">Share your experiences and learn from others</p>
        </div>
        <Link to="/student/create-blog">
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2">
            <i className="fa-solid fa-plus"></i>
            Create Blog
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Category Filter */}
        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative md:w-80">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          />
          <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {/* Blogs Grid */}
      {blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map(blog => (
            <div key={blog._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200">
              {/* Category Badge */}
              <div className="p-4 pb-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(blog.category)}`}>
                  <i className="fa-solid fa-tag"></i>
                  {blog.category}
                </span>
              </div>

              {/* Content */}
              <Link to={`/student/blog/${blog._id}`} className="no-underline">
                <div className="px-4 pb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-indigo-600 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                    {blog.content}
                  </p>
                  {blog.companyName && (
                    <div className="flex items-center gap-1 text-sm text-indigo-600 mb-2">
                      <i className="fa-solid fa-building text-xs"></i>
                      <span className="font-medium">{blog.companyName}</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <img 
                      src={blog.author?.profile || '/default-avatar.png'} 
                      alt={blog.authorName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-medium text-gray-800">{blog.authorName}</p>
                      <p className="text-xs text-gray-500">{getTimeAgo(blog.createdAt)}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleLike(blog._id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
                    blog.likes?.includes(currentUser?.id)
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <i className={`${blog.likes?.includes(currentUser?.id) ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
                  <span className="text-sm font-semibold">{blog.likesCount || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <i className="fa-solid fa-inbox text-6xl text-gray-300 mb-4"></i>
          <p className="text-xl text-gray-600 font-medium">No blogs found</p>
          <p className="text-gray-500 mb-4">Be the first to share your experience!</p>
          <Link to="/student/create-blog">
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              Create First Blog
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default AllBlogs;
