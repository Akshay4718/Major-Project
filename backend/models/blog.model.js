import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Interview Experience', 'Resource Sharing', 'Tips & Tricks', 'Career Advice', 'Other']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  companyName: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
blogSchema.index({ category: 1, createdAt: -1 });
blogSchema.index({ author: 1 });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
