import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getAllOrders,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/orders - Create new order (Logged in users)
// GET /api/orders - Get all orders (Admin only)
router.route('/').post(protect, createOrder).get(protect, admin, getAllOrders);

// GET /api/orders/myorders - Get my orders (Logged in users)
router.route('/myorders').get(protect, getMyOrders);

// GET /api/orders/:id - Get order by ID (Owner or Admin)
router.route('/:id').get(protect, getOrderById);

// PUT /api/orders/:id/pay - Update order to paid (Logged in users)
router.route('/:id/pay').put(protect, updateOrderToPaid);

// PUT /api/orders/:id/deliver - Update order to delivered (Admin only)
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

export default router;
