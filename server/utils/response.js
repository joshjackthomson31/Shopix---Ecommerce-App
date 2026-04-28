/**
 * Response utility helpers
 * Consistent response format across all controllers
 */

/**
 * Send success response
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {object} data - Response data
 * @param {string} message - Optional message
 */
export const sendSuccess = (res, statusCode = 200, data = null, message = null) => {
  const response = {
    success: true,
  };

  if (message) response.message = message;
  if (data !== null) response.data = data;

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} message - Error message
 */
export const sendError = (res, statusCode = 500, message = 'Server Error') => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export default {
  sendSuccess,
  sendError,
};
