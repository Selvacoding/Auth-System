const jwt = require('jsonwebtoken');
const User = require('../models/User');

function ensureAuthenticated(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

async function ensureAdmin(req, res, next) {
  try {
    const user = await User.findById(req.user);
    if (!user.isAdmin) {
      return res.status(403).json({ msg: 'Admin resources, access denied' });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

module.exports = { ensureAuthenticated, ensureAdmin };
