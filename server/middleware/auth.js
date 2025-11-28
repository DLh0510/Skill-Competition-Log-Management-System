const jwt = require('jsonwebtoken');

const auth = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: '未授权' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: '权限不足' });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: '无效的token' });
    }
  };
};

module.exports = auth;
