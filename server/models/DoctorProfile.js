const mongoose = require('mongoose');

const scheduleSlotSchema = new mongoose.Schema(
  {
    available: { type: Boolean, default: false },
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' },
  },
  { _id: false }
);

const doctorProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialty: { type: String, required: true, trim: true },
    bio: { type: String, default: '' },
    education: [
      {
        degree: String,
        institution: String,
        year: Number,
      },
    ],
    hospitalAffiliations: [
      {
        name: String,
        city: String,
      },
    ],
    languages: [{ type: String }],
    consultationPriceMessage: { type: Number, default: 30 },
    consultationPriceVideo: { type: Number, default: 60 },
    schedule: {
      monday:    { type: scheduleSlotSchema, default: () => ({}) },
      tuesday:   { type: scheduleSlotSchema, default: () => ({}) },
      wednesday: { type: scheduleSlotSchema, default: () => ({}) },
      thursday:  { type: scheduleSlotSchema, default: () => ({}) },
      friday:    { type: scheduleSlotSchema, default: () => ({}) },
      saturday:  { type: scheduleSlotSchema, default: () => ({}) },
      sunday:    { type: scheduleSlotSchema, default: () => ({}) },
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalConsultations: { type: Number, default: 0 },
    isAvailableNow: { type: Boolean, default: false },
    yearsOfExperience: { type: Number, default: 0 },
    city: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// Full-text search index on city + specialty
doctorProfileSchema.index({ city: 'text', specialty: 'text' });
doctorProfileSchema.index({ city: 1 });
doctorProfileSchema.index({ specialty: 1 });
doctorProfileSchema.index({ rating: -1 });

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
