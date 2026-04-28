import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import catchAsync from '../utils/catchAsync.js';
import { sendSuccess, sendError } from '../utils/response.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return sendError(res, 400, 'User already exists with this email');
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password, // Will be hashed automatically by our model middleware
  });

  // Send response with token
  sendSuccess(res, 201, {
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email (include password for comparison)
  const user = await User.findOne({ email }).select('+password');

  // Check if user exists AND password matches
  if (user && (await user.matchPassword(password))) {
    sendSuccess(res, 200, {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    sendError(res, 401, 'Invalid email or password');
  }
});

// @desc    Get current user's profile
// @route   GET /api/auth/profile
// @access  Private (requires token)
export const getProfile = catchAsync(async (req, res) => {
  // req.user is set by protect middleware
  sendSuccess(res, 200, {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    isAdmin: req.user.isAdmin,
    createdAt: req.user.createdAt,
  });
});

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = catchAsync(async (req, res) => {
  const users = await User.find({}).select('-password');
  sendSuccess(res, 200, users);
});

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  if (user.isAdmin) {
    return sendError(res, 400, 'Cannot delete admin user');
  }

  await User.deleteOne({ _id: req.params.id });

  sendSuccess(res, 200, null, 'User removed');
});

// @desc    Update user admin status
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
export const updateUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;

  const updatedUser = await user.save();

  sendSuccess(res, 200, {
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
  });
});
