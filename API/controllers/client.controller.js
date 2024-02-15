const client = require('../models/client.model');
const bcrypt = require("bcrypt")

// create controller
const clientController = {};
const saltRounds = 10

/**
 * Create new client
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} email
 * @param {string} phoneNumber
 * @param {string} password
 * @returns {object} client
 * @throws {Error} error
 */

// TODO: create temp phone number verification:
// Validation du compte

clientController.createClient = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password } = req.body;

        // verification phone number
        const regex = new RegExp("^[0-9]{10}$");
        if (!regex.test(phoneNumber)) {
            return res.status(400).json({ message: 'Vérifier votre numéro de téléphone' });
        }

        const mailRegex = new RegExp("^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]{2,}\.[a-z]{2,4}$");
        if (!mailRegex.test(email)) {
            return res.status(400).json({ message: 'Vérifier votre adresse email' });
        }

        // check if client already exists by email or phoneNumber
        const existingClient = await client.findOne({ where: { email: email } });
        if (existingClient) {
            return res.status(400).json({ message: 'Client already exists' });
        }
        const existingClient2 = await client.findOne({ where: { phoneNumber: phoneNumber } });
        if (existingClient2) {
            return res.status(400).json({ message: 'Client already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newClient = new client({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
        });

        await newClient.save();

        res.status(201).json(newClient);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err });
    }
}

clientController.verifyNumber = async (req, res) => {
    try {
        // Assuming secure OTP generation and storage (not shown here)

        const { id, phoneNumber, otpCode } = req.body;

        const existingClient = await client.findOne({
            where: { id: id, phoneNumber: phoneNumber },
        });

        if (!existingClient) {
            return res.status(400).json({ message: 'Utilisateur introuvable' });
        }

        const valid = await verifyOtp(otpCode, trueOtpCode); // Replace with your secure verification logic

        if (!valid) {
            // Handle invalid OTP (e.g., res.status(401).json({ message: 'Code incorrect' }))
            // Consider implementing rate limiting or account locking mechanisms
            return;
        }

        // Update verifiedUser attribute as needed (e.g., existingClient.verified = true; await existingClient.save())
        existingClient.verified = true; await existingClient.save()

        const { password: clientPassword, id: clientId, ...clientWithoutPassword } = existingClient.dataValues;

        req.session.regenerate(function (err) {
            if (err) {
                return res.status(500).json({ message: err });
            }
            req.session.user = clientWithoutPassword;
            res.status(200).json({ message: 'Verification réussie' });

        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur de vérification' }); // Handle errors gracefully
    }
};



/**
 * Authenticate client
 * @param {string} phoneNumber
 * @param {string} password
 * @returns {object} client
 * @throws {Error} error
 */
clientController.authenticateClient = async (req, res) => {
    try {
        if (req.session.user) {
            return res.status(200).json({ message: 'Client already authenticated' });
        }
        const { phoneNumber, password } = req.body;

        // check if client exists by email
        const existingClient = await client.findOne({ where: { phoneNumber: phoneNumber } });
        if (!existingClient) {
            return res.status(400).json({ message: 'Vérifier vos informations' });
        }

        const match = await bcrypt.compare(password, existingClient.password);
        if (!match) {
            return res.status(400).json({ message: 'Vérifiez vos informations' });
        }

        const { password: clientPassword, id: clientId, ...clientWithoutPassword } = existingClient.dataValues;

        req.session.regenerate(function (err) {
            if (err) {
                return res.status(500).json({ message: err });
            }
            req.session.user = clientWithoutPassword;
            return res.status(200).json(clientWithoutPassword);
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err });
    }
}

/**
 * Kill client session
 * @returns {object} message
 */

clientController.logoutClient = async (req, res) => {
    try {
        req.session.destroy(function (err) {
            if (err) {
                return res.status(500).json({ message: err });
            }
            return res.status(200).json({ message: 'Client logged out' });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err });
    }
}

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