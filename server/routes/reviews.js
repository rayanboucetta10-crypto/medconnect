const express = require('express');
const router = express.Router();
const { createReview, getDoctorReviews } = require('../controllers/reviewController');
const { protect, patientOnly } = require('../middleware/auth');

router.post('/', protect, patientOnly, createReview);
router.get('/doctor/:id', getDoctorReviews);

module.exports = router;
