const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const buildProfilePhoto = (name, role) => {
  const bg = role === 'doctor' ? 'B8964E' : '1C3D2E';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=F7F4EF&size=200`;
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, city, dateOfBirth, specialty, bio, yearsOfExperience, languages } = req.body;

    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    const profilePhoto = buildProfilePhoto(name, role);

    const user = await User.create({
      name, email: email.toLowerCase(), passwordHash,
      role: role || 'patient',
      city: city || '',
      profilePhoto,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    });

    let profile = null;
    if (role === 'doctor') {
      profile = await DoctorProfile.create({
        userId: user._id,
        specialty: specialty || 'General Practice',
        bio: bio || '',
        yearsOfExperience: parseInt(yearsOfExperience) || 0,
        languages: languages || [],
        city: city || '',
        consultationPriceMessage: 30,
        consultationPriceVideo: 60,
      });
    }

    const token = signToken(user._id);
    res.cookie('token', token, COOKIE_OPTS);
    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, city: user.city, profilePhoto: user.profilePhoto },
      profile,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

    let profile = null;
    if (user.role === 'doctor') {
      profile = await DoctorProfile.findOne({ userId: user._id });
    }

    const token = signToken(user._id);
    res.cookie('token', token, COOKIE_OPTS);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, city: user.city, profilePhoto: user.profilePhoto },
      profile,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Logged out' });
};

exports.me = async (req, res) => {
  try {
    let profile = null;
    if (req.user.role === 'doctor') {
      profile = await DoctorProfile.findOne({ userId: req.user._id });
    }
    res.json({
      user: { _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, city: req.user.city, profilePhoto: req.user.profilePhoto },
      profile,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, city, profilePhoto, dateOfBirth } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (city !== undefined) updates.city = city;
    if (profilePhoto) updates.profilePhoto = profilePhoto;
    if (dateOfBirth) updates.dateOfBirth = new Date(dateOfBirth);

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-passwordHash');

    // Also update doctor profile city if applicable
    if (req.user.role === 'doctor' && city) {
      await DoctorProfile.findOneAndUpdate({ userId: req.user._id }, { city });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
