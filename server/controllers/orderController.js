import Order from '../models/Order.js';
import catchAsync from '../utils/catchAsync.js';
import { sendSuccess, sendError } from '../utils/response.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = catchAsync(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return sendError(res, 400, 'No order items');
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

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

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  sendSuccess(res, 200, orders);
});
