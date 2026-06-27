const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    doctorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, default: '' },
  },
  { timestamps: true }
);

reviewSchema.index({ doctorId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
