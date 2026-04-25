const express = require('express');
const { apply, dashboard } = require('../controllers/ambassadorController');
const { protect } = require('../middleware/auth');
const { requireTrust } = require('../middleware/trust');

const router = express.Router();

router.use(protect);

// Apply to become an ambassador (trust level 2+)
router.post('/apply', requireTrust(2), apply);

// View own ambassador dashboard
router.get('/dashboard', dashboard);

module.exports = router;
