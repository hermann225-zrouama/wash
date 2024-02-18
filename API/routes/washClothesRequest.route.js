const washClothesRequestController = require('../controllers/washClothesRequest.controller');
const authenticate = require('../middleware/auth.middleware');

// create express router
const express = require('express');
const router = express.Router();

router.post('/register', authenticate, washClothesRequestController.createWashClothesRequest)

module.exports = router;