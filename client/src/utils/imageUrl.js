// Get the full image URL for a product image
// Handles both uploaded images (starting with /) and external URLs

import config from '../config';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.jpg';
  
  // If it starts with /, it's an uploaded file
  if (imagePath.startsWith('/')) {
    return `${config.serverUrl}${imagePath}`;
  }
  
  // Otherwise, it's an external URL
  return imagePath;
};
