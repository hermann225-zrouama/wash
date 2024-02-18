// create express router
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');

const clientController = require('../controllers/client.controller');

router.post('/register', clientController.createClient)
router.post('/login', clientController.authenticateClient)
router.get('/logout', clientController.logoutClient)
router.post('/getclientinfo',authenticate, clientController.getClient)

module.exports = router;