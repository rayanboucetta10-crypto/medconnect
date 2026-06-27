const express = require('express');
const router = express.Router();
const {
  createConsultation, getMyConsultations, updateConsultation,
} = require('../controllers/consultationController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createConsultation);
router.get('/mine', protect, getMyConsultations);
router.put('/:id', protect, updateConsultation);

module.exports = router;
