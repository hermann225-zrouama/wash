const pressingController = require('../controllers/pressing.controller');
const authenticate = require('../middleware/auth.middleware');

// create express router
const express = require('express');
const router = express.Router();

router.post('/create', pressingController.createPressing)
router.post('/authenticate', pressingController.authenticatePressing)
router.get('/getPressing',authenticate, pressingController.getPressing)
router.get('/logout', pressingController.logoutPressing)

module.exports = router;
