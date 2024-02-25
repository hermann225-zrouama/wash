// create express router
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');

const customerController = require('../controllers/customer.controller');

router.get('/info',authenticate, customerController.getCustomer)
router.post('/update',authenticate, customerController.updateCustomer)
router.post('/update/coordinate',authenticate,customerController.updateCoordinate)

module.exports = router;