import express from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  getUsers,
  deleteUser,
  updateUser,
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/register - Create new user (Public)
router.post('/register', registerUser);

// POST /api/auth/login - Login user (Public)
router.post('/login', loginUser);

// GET /api/auth/profile - Get my profile (Protected - requires token)
router.get('/profile', protect, getProfile);

// GET /api/auth/users - Get all users (Admin only)
router.get('/users', protect, admin, getUsers);

// DELETE /api/auth/users/:id - Delete user (Admin only)
// PUT /api/auth/users/:id - Update user (Admin only)
router
  .route('/users/:id')
  .delete(protect, admin, deleteUser)
  .put(protect, admin, updateUser);

export default router;
