import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/products - Get all products (Public)
// POST /api/products - Create product (Admin only)
router.route('/').get(getProducts).post(protect, admin, createProduct);

// GET /api/products/:id - Get single product (Public)
// PUT /api/products/:id - Update product (Admin only)
// DELETE /api/products/:id - Delete product (Admin only)
router
  .route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

// POST /api/products/:id/reviews - Add review (Logged in users)
router.route('/:id/reviews').post(protect, createProductReview);

export default router;
