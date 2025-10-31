import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const authenticateToken = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];

      if (!authHeader) return res.status(401).json({ msg: 'Login Required!' });

      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

      if (!token) return res.status(401).json({ msg: 'Login Required!' });

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ msg: 'Session Expired! Please Login Again.' });
        } else {
          return res.status(401).json({ msg: 'Invalid Token! Please Login.' });
        }
      }

      // Find the user by ID
      const user = await User.findById(decoded.userId);
      if (!user) return res.status(401).json({ msg: 'User not found! Please Login.' });

      // Check if roles are specified and user has the required role
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ msg: 'Access Denied! Insufficient Permissions.' });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error('auth.middleware.js =>', err);
      res.status(500).json({ msg: 'Internal Server Error' });
    }
  };
};

export default authenticateToken;
