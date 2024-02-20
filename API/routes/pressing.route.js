const pressingController = require('../controllers/pressing.controller');
const authenticate = require('../middleware/auth.middleware');

// create express router
const express = require('express');
const router = express.Router();

router.get('/getpressingbyid',authenticate, pressingController.getPressing)
router.get('/update/coordinate',authenticate,pressingController.updateCoordinate)

module.exports = router;
