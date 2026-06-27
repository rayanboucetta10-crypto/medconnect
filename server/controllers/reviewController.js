const Review = require('../models/Review');
const DoctorProfile = require('../models/DoctorProfile');

exports.createReview = async (req, res) => {
  try {
    const { doctorId, rating, comment } = req.body;

    // Check for existing review
    const existing = await Review.findOne({ doctorId, patientId: req.user._id });
    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      await existing.save();
    } else {
      await Review.create({
        doctorId,
        patientId: req.user._id,
        rating,
        comment,
      });
    }

    // Recalculate doctor rating
    const reviews = await Review.find({ doctorId });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await DoctorProfile.findOneAndUpdate(
      { userId: doctorId },
      { rating: Math.round(avg * 10) / 10 }
    );

    res.status(201).json({ message: 'Review submitted' });
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
