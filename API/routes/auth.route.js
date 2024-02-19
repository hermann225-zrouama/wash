// create express router
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');

const authController = require('../controllers/auth.controller');

// CLIENT
router.post('/register/client', authController.registerClient)
router.post('/login/client', authController.loginClient)
router.get('/logout/client',authenticate, authController.logoutClient)

// PRESSING
router.post('/register/pressing', authController.registerPressing)
router.post('/login/pressing', authController.loginPressing)
router.get('/logout/pressing',authenticate, authController.logoutPressing)

module.exports = router;