const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    // Accept token from httpOnly cookie OR Authorization header (dev convenience)
    let token = req.cookies?.token;
    if (!token) {
      const auth = req.headers.authorization;
      if (auth?.startsWith('Bearer ')) token = auth.split(' ')[1];
    }

    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

exports.doctorOnly = (req, res, next) => {
  if (req.user?.role !== 'doctor')
    return res.status(403).json({ message: 'Doctor access only' });
  next();
};

exports.patientOnly = (req, res, next) => {
  if (req.user?.role !== 'patient')
    return res.status(403).json({ message: 'Patient access only' });
  next();
};
