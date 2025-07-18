const Post = require('../models/Post');
const mongoose = require('mongoose');

const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      filter.status = 'published';
    }
    
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    const posts = await Post.find(filter)
      .populate('author', 'username email')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Post.countDocuments(filter);
    
    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Server error while fetching posts' });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    
    const post = await Post.findById(id)
      .populate('author', 'username email')
      .populate('category', 'name')
      .populate('comments.user', 'username');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    post.views += 1;
    await post.save();
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Server error while fetching post' });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content, category, tags, status } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ 
        error: 'Title, content, and category are required' 
      });
    }
    
    const post = new Post({
      title,
      content,
      category,
      author: req.user._id,
      tags: tags || [],
      status: status || 'draft'
    });
    
    await post.save();
    await post.populate('author', 'username email');
    await post.populate('category', 'name');
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Post with this title already exists' });
    }
    
    res.status(500).json({ error: 'Server error while creating post' });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags, status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You can only edit your own posts.' });
    }
    
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (tags) post.tags = tags;
    if (status) post.status = status;
    
    await post.save();
    await post.populate('author', 'username email');
    await post.populate('category', 'name');
    
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ error: 'Server error while updating post' });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You can only delete your own posts.' });
    }
    
    await Post.findByIdAndDelete(id);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Server error while deleting post' });
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
};