const { createPost, updatePost, deletePost } = require('../../src/controllers/postController');
const Post = require('../../src/models/Post');
const mongoose = require('mongoose');

jest.mock('../../src/models/Post');

describe('Post Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: {
        _id: new mongoose.Types.ObjectId(),
        role: 'user'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create a new post successfully', async () => {
      const mockPost = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Post',
        content: 'Test Content',
        category: new mongoose.Types.ObjectId(),
        author: req.user._id,
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis()
      };

      req.body = {
        title: 'Test Post',
        content: 'Test Content',
        category: new mongoose.Types.ObjectId().toString()
      };

      Post.mockImplementation(() => mockPost);

      await createPost(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPost);
      expect(mockPost.save).toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = {
        content: 'Test Content'
      };

      await createPost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Title, content, and category are required'
      });
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      validationError.errors = {
        title: { message: 'Title is required' }
      };

      const mockPost = {
        save: jest.fn().mockRejectedValue(validationError),
        populate: jest.fn().mockReturnThis()
      };

      req.body = {
        title: 'Test Post',
        content: 'Test Content',
        category: new mongoose.Types.ObjectId().toString()
      };

      Post.mockImplementation(() => mockPost);

      await createPost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Title is required'
      });
    });
  });

  describe('updatePost', () => {
    it('should update post successfully when user is author', async () => {
      const postId = new mongoose.Types.ObjectId();
      const mockPost = {
        _id: postId,
        title: 'Original Title',
        author: req.user._id,
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis()
      };

      req.params.id = postId.toString();
      req.body = {
        title: 'Updated Title',
        content: 'Updated Content'
      };

      Post.findById.mockResolvedValue(mockPost);

      await updatePost(req, res);

      expect(mockPost.title).toBe('Updated Title');
      expect(mockPost.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockPost);
    });

    it('should return 403 if user is not the author', async () => {
      const postId = new mongoose.Types.ObjectId();
      const differentUserId = new mongoose.Types.ObjectId();
      const mockPost = {
        _id: postId,
        author: differentUserId
      };

      req.params.id = postId.toString();
      req.body = { title: 'Updated Title' };

      Post.findById.mockResolvedValue(mockPost);

      await updatePost(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access denied. You can only edit your own posts.'
      });
    });

    it('should return 404 if post not found', async () => {
      const postId = new mongoose.Types.ObjectId();
      req.params.id = postId.toString();

      Post.findById.mockResolvedValue(null);

      await updatePost(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Post not found'
      });
    });
  });

  describe('deletePost', () => {
    it('should delete post successfully when user is author', async () => {
      const postId = new mongoose.Types.ObjectId();
      const mockPost = {
        _id: postId,
        author: req.user._id
      };

      req.params.id = postId.toString();

      Post.findById.mockResolvedValue(mockPost);
      Post.findByIdAndDelete.mockResolvedValue(mockPost);

      await deletePost(req, res);

      expect(Post.findByIdAndDelete).toHaveBeenCalledWith(postId.toString());
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post deleted successfully'
      });
    });

    it('should return 403 if user is not the author', async () => {
      const postId = new mongoose.Types.ObjectId();
      const differentUserId = new mongoose.Types.ObjectId();
      const mockPost = {
        _id: postId,
        author: differentUserId
      };

      req.params.id = postId.toString();

      Post.findById.mockResolvedValue(mockPost);

      await deletePost(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access denied. You can only delete your own posts.'
      });
    });
  });
});