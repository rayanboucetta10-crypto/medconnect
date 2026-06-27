const express = require('express');
const router = express.Router();
const {
  getDoctors, getDoctorById, updateDoctorProfile,
  getDoctorReviews, getSpecialties, getCities,
} = require('../controllers/doctorController');
const { protect, doctorOnly } = require('../middleware/auth');

router.get('/', getDoctors);
router.get('/specialties', getSpecialties);
router.get('/cities', getCities);
router.get('/:id', getDoctorById);
router.put('/:id', protect, doctorOnly, updateDoctorProfile);
router.get('/:id/reviews', getDoctorReviews);

module.exports = router;
