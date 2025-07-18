const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
} = require('../controllers/postController');

router.get('/', getPosts);
router.get('/:id', getPostById);

router.post('/', authenticate, createPost);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);

module.exports = router;