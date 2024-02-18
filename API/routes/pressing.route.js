const pressingController = require('../controllers/pressing.controller');
const authenticate = require('../middleware/auth.middleware');

// create express router
const express = require('express');
const router = express.Router();

router.post('/register', pressingController.createPressing)
router.post('/login', pressingController.authenticatePressing)
router.get('/getpressingbyid',authenticate, pressingController.getPressing)
router.get('/logout', pressingController.logoutPressing)

module.exports = router;
