const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:      { type: String, enum: ['message', 'video'], default: 'video' },
    status:    { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    scheduledAt: { type: Date },
    notes:     { type: String, default: '' },
    price:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

consultationSchema.index({ patientId: 1 });
consultationSchema.index({ doctorId: 1 });
consultationSchema.index({ status: 1 });

module.exports = mongoose.model('Consultation', consultationSchema);
