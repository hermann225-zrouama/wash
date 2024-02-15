// create express router
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');

const clientController = require('../controllers/client.controller');

router.post('/create', clientController.createClient)
router.post('/authenticate', clientController.authenticateClient)
router.get('/logout', clientController.logoutClient)
router.post('/getclient',authenticate, clientController.getClient)

module.exports = router;