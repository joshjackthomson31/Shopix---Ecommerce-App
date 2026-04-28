import Product from '../models/Product.js';
import catchAsync from '../utils/catchAsync.js';
import { sendSuccess, sendError } from '../utils/response.js';

// @desc    Get all products (with search & category filter)
// @route   GET /api/products
// @route   GET /api/products?keyword=iphone&category=Electronics
// @access  Public
export const getProducts = catchAsync(async (req, res) => {
  const { keyword, category } = req.query;
  
  // Build query object
  const query = {};
  
  // Search by keyword (name or brand)
  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { brand: { $regex: keyword, $options: 'i' } },
    ];
  }
  
  // Filter by category
  if (category && category !== 'All') {
    query.category = category;
  }
  
  const products = await Product.find(query);
  
  // Get unique categories for filter dropdown
  const categories = await Product.distinct('category');
  
  res.status(200).json({
    success: true,
    count: products.length,
    categories: ['All', ...categories],
    data: products,
  });
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return sendError(res, 404, 'Product not found');
  }

  sendSuccess(res, 200, product);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = catchAsync(async (req, res) => {
  const { name, image, brand, category, description, price, countInStock } = req.body;

  const product = await Product.create({
    user: req.user._id, // Admin who created it
    name,
    image,
    brand,
    category,
    description,
    price,
    countInStock,
  });

  sendSuccess(res, 201, product);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = catchAsync(async (req, res) => {
  const { name, image, brand, category, description, price, countInStock } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return sendError(res, 404, 'Product not found');
  }

  // Update fields (use ?? for numbers to allow 0 values)
  product.name = name || product.name;
  product.image = image || product.image;
  product.brand = brand || product.brand;
  product.category = category || product.category;
  product.description = description || product.description;
  product.price = price ?? product.price;
  product.countInStock = countInStock ?? product.countInStock;

  const updatedProduct = await product.save();

  sendSuccess(res, 200, updatedProduct);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return sendError(res, 404, 'Product not found');
  }

  await Product.deleteOne({ _id: req.params.id });

  sendSuccess(res, 200, null, 'Product removed');
});

// @desc    Create a new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = catchAsync(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return sendError(res, 404, 'Product not found');
  }

  // Check if user already reviewed
  const alreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    return sendError(res, 400, 'You have already reviewed this product');
  }

  // Create review object
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  // Add to reviews array
  product.reviews.push(review);

  // Update review count
  product.numReviews = product.reviews.length;

  // Calculate average rating
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save();

  sendSuccess(res, 201, null, 'Review added');
});
