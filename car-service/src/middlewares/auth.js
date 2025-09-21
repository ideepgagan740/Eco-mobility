// const jwt = require('../config/jwt');
// const { verify } = require('../config/jwt');
const { verify } = require('../../../shared/auth/jwt');

module.exports = async function (req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'No token provided' });
  try {
    const decoded = verify(token);
    req.user = decoded;;
    next();
  } catch (err) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid token' });
  }
};
