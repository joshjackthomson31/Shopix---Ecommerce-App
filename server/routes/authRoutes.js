import express from 'express';
import rateLimit from 'express-rate-limit';
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

// Rate limiter — max 10 auth attempts per IP per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many attempts from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
});

// POST /api/auth/register - Create new user (Public)
router.post('/register', authLimiter, registerUser);

// POST /api/auth/login - Login user (Public)
router.post('/login', authLimiter, loginUser);

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
