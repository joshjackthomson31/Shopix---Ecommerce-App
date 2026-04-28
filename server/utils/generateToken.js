import jwt from 'jsonwebtoken';
import config from '../config/index.js';

// Generate a JWT token for a user
const generateToken = (id) => {
  return jwt.sign(
    { id },                    // Payload: data stored in token
    config.jwtSecret,          // Secret key (from config)
    { expiresIn: config.jwtExpire }  // Token expires in 30 days
  );
};

export default generateToken;
