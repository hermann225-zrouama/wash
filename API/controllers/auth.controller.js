const Pressing = require('../models/pressing.model');
const Customer = require('../models/customer.model');
const Coordinate = require('../models/coordinate.model')
const bcrypt = require("bcrypt")

const saltRounds = 10

// create controller
const authController = {};

const regexPhoneNumber = new RegExp("^\\+(225)(01|05|07)[0-9]{8}$");
const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const mailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]{2,}\.[a-z]{2,4}$/;

/**
 * Create new customer
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} email
 * @param {string} phoneNumber
 * @param {string} password
 * @returns {object} customer
 * @throws {Error} error
 */
authController.registerCustomer = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        if (!regexPhoneNumber.test(phoneNumber)) {
            return res.status(400).json({ message: 'Invalid phone number', info: 'phoneNumber' });
        }

        if(!regexPassword.test(password)){
            return res.status(400).json({ message: 'Weak password', info: 'password' });
        }

        const existingCustomer = await Customer.findOne({ where: { phoneNumber: phoneNumber } });
        if (existingCustomer) {
            return res.status(400).json({ message: 'Phone number already exists', info: 'phoneNumber' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newCustomer = new Customer({
            phoneNumber,
            password: hashedPassword,
        });

        await newCustomer.save();

        const newCoordinate = new Coordinate({
            userId: newCustomer.id,
            category: "CUSTOMER"
        })

        await newCoordinate.save()

        res.status(201).json({ message: "USER CREATED SUCCESSFULLY" });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err });
    }
}

/**
 * Authenticate customer
 * @param {string} phoneNumber
 * @param {string} password
 * @returns {object} customer
 * @throws {Error} error
 */
authController.loginCustomer = async (req, res) => {
    try {

        const { phoneNumber, password } = req.body;

        // check if customer exists by email
        const existingCustomer = await Customer.findOne({ where: { phoneNumber: phoneNumber } });
        if (!existingCustomer) {
            return res.status(400).json({ message: 'Incorrect information' });
        }

        const match = await bcrypt.compare(password, existingCustomer.password);
        if (!match) {
            return res.status(400).json({ message: 'Incorrect information' });
        }

        const { password: customerPassword,id: customerId, ...customerWithoutPassword } = existingCustomer.dataValues;

        req.session.regenerate(function (err) {
            if (err) {
                return res.status(500).json({ message: err });
            }
            req.session.user = customerWithoutPassword;
            req.session.user.id = customerId
            return res.status(200).json(customerWithoutPassword);
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err });
    }
}

/**
 * Kill customer session
 * @returns {object} message
 */

authController.logoutCustomer = async (req, res) => {
    try {
        req.session.destroy(function (err) {
            if (err) {
                return res.status(500).json({ message: err });
            }
            return res.status(200).json({ message: 'Logout successful' });
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
    try {
        const { name, lat, long, phoneNumber, password, address, email } = req.body;

        if (!name || typeof name !== 'string') {
            return res.status(400).json({ message: 'Invalid name', info: 'name' });
        }

        // Add validations for lat and long as needed
        if (!lat || typeof lat !== 'number') {
            return res.status(400).json({ message: 'Invalid latitude', info: 'lat' });
        }

        if (!long || typeof long !== 'number') {
            return res.status(400).json({ message: 'Invalid longitude', info: 'long' });
        }

        if (!regexPhoneNumber.test(phoneNumber)) {
            return res.status(400).json({ message: 'Invalid phone number', info: 'phoneNumber' });
        }

        if (!regexPassword.test(password)) {
            return res.status(400).json({ message: 'Weak password', info: 'password' });
        }

        if (!mailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email address', info: 'email' });
        }

        if (!address || typeof address !== 'string') {
            return res.status(400).json({ message: 'Invalid address', info: 'address' });
        }

        const existingPressing = await Pressing.findOne({ where: { phoneNumber: phoneNumber } });
        if (existingPressing) {
            return res.status(400).json({ message: 'Phone number already exists', info: 'phoneNumber' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newPressing = new Pressing({
            name,
            phoneNumber,
            password: hashedPassword,
            address,
            email
        });

        await newPressing.save();

        const newCoordinate = new Coordinate({
            userId: newPressing.id,
            category: "PRESSING",
            lat,
            long,
        })

        await newCoordinate.save()

        res.status(200).json({message: 'Pressing account created succesfully'})

    } catch (err) {
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
    try {

        const { phoneNumber, password } = req.body;

        const existingPressing = await Pressing.findOne({ where: { phoneNumber: phoneNumber } });

        if (!existingPressing) {
            return res.status(400).json({ message: 'Incorrect information' });
        }

        const match = await bcrypt.compare(password, existingPressing.password);
        if (!match) {
            return res.status(400).json({ message: 'Incorrect information' });
        }

        const { password: pressingPassword, id: pressingId, ...pressingWithoutPassword } = existingPressing.dataValues;

        req.session.regenerate(function (err) {
            if (err) {
                return res.status(500).json({ message: err });
            }
            req.session.user = pressingWithoutPassword;
            req.session.user.id = pressingId
            return res.status(200).json(pressingWithoutPassword);
        });

        res.status(200).json(pressingWithoutPassword);

    } catch (err) {
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
    try {
        req.session.destroy(function (err) {
            if (err) {
                return res.status(500).json({ message: err });
            }
            return res.status(200).json({ message: 'Pressing logged out' });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err });
    }
}

module.exports = authController;
