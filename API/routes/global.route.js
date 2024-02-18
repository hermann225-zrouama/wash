// create express router
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');

const globalController = require('../controllers/global.controller');

router.post('/register',authenticate, globalController.getPrice)

module.exports = router