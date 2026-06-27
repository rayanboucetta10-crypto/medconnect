const DoctorProfile = require('../models/DoctorProfile');
const Review = require('../models/Review');
const User = require('../models/User');

exports.getDoctors = async (req, res) => {
  try {
    const { city, specialty, lang, availability, minRating, sort = 'rating', page = 1, limit = 10 } = req.query;

    const filter = {};
    if (city)         filter.city = { $regex: new RegExp(city, 'i') };
    if (specialty)    filter.specialty = { $regex: new RegExp(specialty, 'i') };
    if (lang)         filter.languages = { $in: [new RegExp(lang, 'i')] };
    if (availability === 'now') filter.isAvailableNow = true;
    if (minRating)    filter.rating = { $gte: parseFloat(minRating) };

    const sortMap = {
      rating:     { rating: -1 },
      experience: { yearsOfExperience: -1 },
      price:      { consultationPriceVideo: 1 },
    };
    const sortObj = sortMap[sort] || { rating: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await DoctorProfile.countDocuments(filter);
    const profiles = await DoctorProfile.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name profilePhoto city');

    const doctors = profiles.map((p) => ({
      _id: p._id,
      userId: p.userId?._id,
      specialty: p.specialty,
      rating: p.rating,
      yearsOfExperience: p.yearsOfExperience,
      totalConsultations: p.totalConsultations,
      isAvailableNow: p.isAvailableNow,
      languages: p.languages,
      city: p.city || p.userId?.city,
      consultationPriceMessage: p.consultationPriceMessage,
      consultationPriceVideo: p.consultationPriceVideo,
      user: p.userId,
    }));

    res.json({
      doctors,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({ userId: req.params.id })
      .populate('userId', 'name profilePhoto city email');

    if (!profile) return res.status(404).json({ message: 'Doctor not found' });

    const reviews = await Review.find({ doctorId: req.params.id })
      .populate('patientId', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      doctor: {
        ...profile.toObject(),
        user: profile.userId,
        userId: profile.userId?._id,
      },
      reviews,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateDoctorProfile = async (req, res) => {
  try {
    // Only the doctor themselves can update their profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const allowed = [
      'specialty', 'bio', 'education', 'hospitalAffiliations',
      'languages', 'consultationPriceMessage', 'consultationPriceVideo',
      'schedule', 'isAvailableNow', 'yearsOfExperience', 'city',
    ];

    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const profile = await DoctorProfile.findOneAndUpdate(
      { userId: req.params.id },
      updates,
      { new: true }
    ).populate('userId', 'name profilePhoto city');

    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ doctorId: req.params.id })
      .populate('patientId', 'name profilePhoto')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSpecialties = async (_req, res) => {
  try {
    const specs = await DoctorProfile.distinct('specialty');
    res.json({ specialties: specs.sort() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCities = async (_req, res) => {
  try {
    const cities = await DoctorProfile.distinct('city');
    res.json({ cities: cities.filter(Boolean).sort() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
