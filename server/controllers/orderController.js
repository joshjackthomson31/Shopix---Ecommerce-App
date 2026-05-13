import Order from '../models/Order.js';
import Product from '../models/Product.js';
import catchAsync from '../utils/catchAsync.js';
import { sendSuccess, sendError } from '../utils/response.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = catchAsync(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return sendError(res, 400, 'No order items');
  }

  // Fetch each product from DB to get the real price — never trust client-sent prices
  const dbProducts = await Product.find({
    _id: { $in: orderItems.map((item) => item.product) },
  });

  if (dbProducts.length !== orderItems.length) {
    return sendError(res, 400, 'One or more products not found');
  }

  // Build order items using DB data for name, image, and price
  // Also validate stock availability before proceeding
  const resolvedItems = [];
  for (const item of orderItems) {
    const dbProduct = dbProducts.find(
      (p) => p._id.toString() === item.product.toString()
    );

    if (dbProduct.countInStock < item.qty) {
      return sendError(
        res,
        400,
        `Not enough stock for "${dbProduct.name}". Available: ${dbProduct.countInStock}`
      );
    }

    resolvedItems.push({
      name: dbProduct.name,
      qty: item.qty,
      image: dbProduct.image,
      price: dbProduct.price, // authoritative price from DB
      product: dbProduct._id,
    });
  }

  // Calculate all prices server-side using the same rules as the frontend
  const itemsPrice = resolvedItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  const taxPrice = itemsPrice * 0.1;                  // 10% tax
  const shippingPrice = itemsPrice > 5000 ? 0 : 99;  // Free shipping over ₹5000
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  const order = await Order.create({
    user: req.user._id,
    orderItems: resolvedItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  // Decrement countInStock for each ordered product
  await Promise.all(
    resolvedItems.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: -item.qty },
      })
    )
  );

  sendSuccess(res, 201, order);
});

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  sendSuccess(res, 200, orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (!order) {
    return sendError(res, 404, 'Order not found');
  }

  // Check if user owns this order or is admin
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    return sendError(res, 401, 'Not authorized to view this order');
  }

  sendSuccess(res, 200, order);
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return sendError(res, 404, 'Order not found');
  }

  // Only the order owner or an admin can mark an order as paid
  if (
    order.user.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    return sendError(res, 403, 'Not authorized to update this order');
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.payer?.email_address || req.body.email_address,
  };

  const updatedOrder = await order.save();

  sendSuccess(res, 200, updatedOrder);
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return sendError(res, 404, 'Order not found');
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  sendSuccess(res, 200, updatedOrder);
});

// @desc    Get all orders (admin)
// @route   GET /api/orders?page=1&limit=20
// @access  Private/Admin
export const getAllOrders = catchAsync(async (req, res) => {
  const { page, limit } = req.query;

  // Pagination — optional; omit page/limit to get all orders (backward compatible)
  const pageNum = parseInt(page, 10) || null;
  const limitNum = parseInt(limit, 10) || null;
  const usePagination = pageNum && limitNum;

  const totalCount = await Order.countDocuments();

  let orderQuery = Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
  if (usePagination) {
    const skip = (pageNum - 1) * limitNum;
    orderQuery = orderQuery.skip(skip).limit(limitNum);
  }

  const orders = await orderQuery;

  res.status(200).json({
    success: true,
    count: orders.length,
    total: totalCount,
    ...(usePagination && {
      page: pageNum,
      pages: Math.ceil(totalCount / limitNum),
    }),
    data: orders,
  });
});
