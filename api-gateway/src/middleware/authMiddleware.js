const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

const validateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

//   logger.info(`Authorization header: ${authHeader}`);
//   logger.info(`Extracted token: ${token}`);

  if (!token) {
    logger.warn('Access attempt without valid token');
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn(`Invalid token from API Gateway! ${err.message}`);
      return res.status(401).json({
        success: false,
        message: `Invalid token! ${err.message}`,
      });
    }

    req.user = user;
    next();
  });
};

module.exports = { validateToken };
