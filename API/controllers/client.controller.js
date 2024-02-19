const client = require('../models/client.model');
const bcrypt = require("bcrypt")

// create controller
const clientController = {};

clientController.getClient = async (req, res) => {
    try {
        if (req.session.user) {
            return req.session.user
        }

        return res.status(401).json({ message: "Connexion requise" })

    } catch (error) {
        return res.status(500).json(error)
    }
}

module.exports = clientController;