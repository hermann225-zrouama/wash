const pressing = require('../models/pressing.model');
const client = require('../models/client.model');
const bcrypt = require("bcrypt")

const saltRounds = 10

// create controller
const authController = {};

// CLIENT

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
authController.registerClient = async (req, res) => {
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


/**
 * Authenticate client
 * @param {string} phoneNumber
 * @param {string} password
 * @returns {object} client
 * @throws {Error} error
 */
authController.loginClient = async (req, res) => {
    try {

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

authController.logoutClient = async (req, res) => {
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

// PRESSING

/**
 * Create new pressing
 * @param {string} name
 * @param {string} lat
 * @param {string} long
 * @param {string} phoneNumber
 * @param {string} password
 * @param {string} address
 * @returns {object} pressing
 * @throws {Error} error
 */
authController.registerPressing = async (req, res) => {
    try{
        const { name, lat, long, phoneNumber,password, address,email } = req.body;

        // verification phone number
        const regex = new RegExp("^[0-9]{10}$");
        if (!regex.test(phoneNumber)) {
            return res.status(400).json({ message: 'Vérifier votre numéro de téléphone' });
        }

        const mailRegex = new RegExp("^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]{2,}\.[a-z]{2,4}$");
        if (!mailRegex.test(email)) {
            return res.status(400).json({ message: 'Vérifier votre adresse email' });
        }

        // check if pressing already exists by email or phoneNumber
        const existingPressing = await pressing.findOne({ where: { phoneNumber: phoneNumber } });
        if (existingPressing) {
            return res.status(400).json({ message: 'Pressing already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newPressing = new pressing({
            name,
            lat,
            long,
            phoneNumber,
            password: hashedPassword,
            address,
            email
        });

        await newPressing.save();

        res.status(201).json(newPressing);

    }catch(err){
        console.log(err);
        return res.status(500).json({ message: err });
    }
}

/**
 * Authenticate pressing
 * @param {string} phoneNumber
 * @param {string} password
 * @returns {object} pressing
 * @throws {Error} error
 */
authController.loginPressing = async (req, res) => {
    try{
        if (req.session.user) {
            return res.status(200).json({ message: 'Pressing already authenticated' });
        }
        const { phoneNumber, password } = req.body;

        // check if pressing exists by email
        const existingPressing = await pressing.findOne({ where: { phoneNumber: phoneNumber } });
        if (!existingPressing) {
            return res.status(400).json({ message: 'Vérifier vos informations' });
        }

        const match = await bcrypt.compare(password, existingPressing.password);
        if(!match){
            return res.status(400).json({ message: 'Vérifiez vos informations' });
        }

        const { password: pressingPassword, id: pressingId, ...pressingWithoutPassword } = existingPressing.dataValues;

        req.session.user = pressingId;

        res.status(200).json(pressingWithoutPassword);

    }catch(err){
        console.log(err);
        return res.status(500).json({ message: err });
    }
}

/**
 * Kill pressing session
 * @returns {object} message
 * @throws {Error} error
 */
authController.logoutPressing = async (req, res) => {
    try{
        req.session.destroy(function(err) {
            if(err){
                return res.status(500).json({ message: err });
            }
            return res.status(200).json({ message: 'Pressing logged out' });
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: err });
    }
}


module.exports = authController