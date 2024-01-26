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

clientController.createClient = async (req, res) => {
    try{
        const { firstName, lastName, email, phoneNumber,password } = req.body;

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

    }catch(err){
        console.log(err);
        return res.status(500).json({ message: err });
    }
}

/**
 * Authenticate client
 * @param {string} phoneNumber
 * @param {string} password
 * @returns {object} client
 * @throws {Error} error
 */
clientController.authenticateClient = async (req, res) => {
    try{
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
        if(!match){
            return res.status(400).json({ message: 'Vérifiez vos informations' });
        }

        const { password: clientPassword, id: clientId, ...clientWithoutPassword } = existingClient.dataValues;

        req.session.regenerate(function(err) {
            if(err){
                return res.status(500).json({ message: err });
            }
            req.session.user = clientWithoutPassword;
            return res.status(200).json(clientWithoutPassword);
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({ message: err });
    }
}

/**
 * Kill client session
 * @returns {object} message
 */

clientController.logoutClient = async (req, res) => {
    try{
        req.session.destroy(function(err) {
            if(err){
                return res.status(500).json({ message: err });
            }
            return res.status(200).json({ message: 'Client logged out' });
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: err });
    }
}



module.exports = clientController;