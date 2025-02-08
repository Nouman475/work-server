const jwt = require('jsonwebtoken');
const User = require('../Models/user');

const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from cookies
    const token = req.cookies?.AccessToken;
    console.log(token)
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Attach user to request
    req.user = user;

    // Pass control to the next middleware
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid token.' });
    }

    // Default to a generic error
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = authMiddleware;
