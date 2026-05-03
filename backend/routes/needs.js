const express = require('express');
const { body } = require('express-validator');
const { postNeed, getNeeds, deleteNeed } = require('../controllers/needController');
const { protect } = require('../middleware/auth');
const { requireTrust } = require('../middleware/trust');

const router = express.Router();

const CATEGORIES = ['textbooks', 'electronics', 'formal-wear', 'cycles', 'hobby-gear', 'hostel-essentials'];

const createValidators = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(CATEGORIES).withMessage(`category must be one of: ${CATEGORIES.join(', ')}`),
  body('type').isIn(['buy', 'rent']).withMessage('type must be buy or rent'),
  body('maxBudget')
    .optional()
    .isInt({ min: 0 })
    .withMessage('maxBudget must be a non-negative integer (paise)'),
];

// All needs routes require authentication
router.use(protect);

// PRD: Level 0 (phone verified) can post needs — only auth required, no trust gate
router.post('/', createValidators, postNeed);
router.get('/', getNeeds);
router.delete('/:id', deleteNeed);

module.exports = router;
