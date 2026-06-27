const Consultation = require('../models/Consultation');
const DoctorProfile = require('../models/DoctorProfile');

exports.createConsultation = async (req, res) => {
  try {
    const { doctorId, type, scheduledAt, notes } = req.body;
    if (!doctorId) return res.status(400).json({ message: 'Doctor ID required' });

    // Get price from doctor profile
    const profile = await DoctorProfile.findOne({ userId: doctorId });
    const price = type === 'video'
      ? (profile?.consultationPriceVideo || 60)
      : (profile?.consultationPriceMessage || 30);

    const consultation = await Consultation.create({
      patientId: req.user._id,
      doctorId,
      type: type || 'video',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      notes: notes || '',
      price,
    });

    await consultation.populate([
      { path: 'patientId', select: 'name profilePhoto' },
      { path: 'doctorId', select: 'name profilePhoto' },
    ]);

    // Increment doctor's total consultations on booking (optimistic)
    await DoctorProfile.findOneAndUpdate(
      { userId: doctorId },
      { $inc: { totalConsultations: 1 } }
    );

    res.status(201).json({ consultation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyConsultations = async (req, res) => {
  try {
    const { status } = req.query;
    const isDoctor = req.user.role === 'doctor';

    const filter = isDoctor
      ? { doctorId: req.user._id }
      : { patientId: req.user._id };

    if (status) filter.status = status;

    const consultations = await Consultation.find(filter)
      .populate('patientId', 'name profilePhoto city')
      .populate('doctorId', 'name profilePhoto city')
      .sort({ scheduledAt: -1, createdAt: -1 });

    res.json({ consultations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateConsultation = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });

    // Patients can cancel; doctors can confirm/complete/cancel
    const userId = req.user._id.toString();
    const isOwner = [consultation.patientId, consultation.doctorId].map(String).includes(userId);
    if (!isOwner) return res.status(403).json({ message: 'Forbidden' });

    if (status) consultation.status = status;
    if (notes !== undefined) consultation.notes = notes;
    await consultation.save();

    await consultation.populate([
      { path: 'patientId', select: 'name profilePhoto' },
      { path: 'doctorId', select: 'name profilePhoto' },
    ]);

    res.json({ consultation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
