// create express router
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');

const authController = require('../controllers/auth.controller');

router.post('/token/refresh', authenticate,authController.refreshToken)

// customer
router.post('/register/customer', authController.registerCustomer)
router.post('/login/customer', authController.loginCustomer)
router.get('/logout/customer',authenticate, authController.logoutCustomer)

// PRESSING
router.post('/register/pressing', authController.registerPressing)
router.post('/login/pressing', authController.loginPressing)
router.get('/logout/pressing',authenticate, authController.logoutPressing)

module.exports = router;