/**
 * Async handler wrapper
 * Eliminates need for try/catch in every controller
 * 
 * Usage:
 * export const getProducts = catchAsync(async (req, res) => {
 *   const products = await Product.find();
 *   res.json(products);
 * });
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync;
