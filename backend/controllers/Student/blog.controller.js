import Blog from '../../models/blog.model.js';
import User from '../../models/user.model.js';

// Create a new blog post
export const createBlog = async (req, res) => {
  try {
    const { title, content, category, tags, companyName } = req.body;
    const userId = req.user.id;

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const authorName = `${user.first_name} ${user.middle_name || ''} ${user.last_name}`.trim();

    const blog = new Blog({
      title,
      content,
      category,
      author: userId,
      authorName,
      tags: tags || [],
      companyName: companyName || ''
    });

    await blog.save();

    res.status(201).json({
      msg: 'Blog posted successfully',
      blog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ msg: 'Server error while creating blog' });
  }
};

// Get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .populate('author', 'first_name last_name profile');

    res.status(200).json({ blogs });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ msg: 'Server error while fetching blogs' });
  }
};

// Get single blog by ID
export const getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId)
      .populate('author', 'first_name middle_name last_name profile email');

    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }

    res.status(200).json({ blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ msg: 'Server error while fetching blog' });
  }
};

// Like/Unlike a blog
export const toggleLike = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user.id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }

    const likeIndex = blog.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike
      blog.likes.splice(likeIndex, 1);
      blog.likesCount = blog.likes.length;
      await blog.save();
      return res.status(200).json({ msg: 'Blog unliked', liked: false, likesCount: blog.likesCount });
    } else {
      // Like
      blog.likes.push(userId);
      blog.likesCount = blog.likes.length;
      await blog.save();
      return res.status(200).json({ msg: 'Blog liked', liked: true, likesCount: blog.likesCount });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ msg: 'Server error while toggling like' });
  }
};

// Get user's own blogs
export const getMyBlogs = async (req, res) => {
  try {
    const userId = req.user.id;

    const blogs = await Blog.find({ author: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({ blogs });
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    res.status(500).json({ msg: 'Server error while fetching your blogs' });
  }
};

// Delete a blog
export const deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user.id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }

    // Check if user is the author
    if (blog.author.toString() !== userId) {
      return res.status(403).json({ msg: 'You are not authorized to delete this blog' });
    }

    await Blog.findByIdAndDelete(blogId);
    res.status(200).json({ msg: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ msg: 'Server error while deleting blog' });
  }
};
