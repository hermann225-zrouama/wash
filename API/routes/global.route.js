// create express router
const express = require('express');
const router = express.Router();

const globalController = require('../controllers/global.controller');

router.post('/register', globalController.getPrice)