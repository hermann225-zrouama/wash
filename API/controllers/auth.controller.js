const jwt = require('jsonwebtoken');
const Pressing = require('../models/pressing.model');
const Customer = require('../models/customer.model');
const RefreshToken = require('../models/refreshToken.model')
const Coordinate = require('../models/coordinate.model')
const bcrypt = require("bcrypt")
const crypto = require('crypto');


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

        if (!regexPassword.test(password)) {
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
            id: crypto.randomUUID()
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
            return res.status(401).json({ message: 'Incorrect information' });
        }

        const match = await bcrypt.compare(password, existingCustomer.password);
        if (!match) {
            return res.status(400).json({ message: 'Incorrect information' });
        }

        const { password: customerPassword, id: customerId, ...customerWithoutPassword } = existingCustomer.dataValues;

        // JWT
        const accessToken = jwt.sign(
            { 
                id: existingCustomer.id, 
                email: existingCustomer.email, 
            },
            process.env.JWT_SECRET || "secret",
            {
                algorithm: process.env.JWT_ALG || 'HS256',
                audience: process.env.JWT_AUDIENCE || 'default_audience',
                expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '3600',
                issuer: process.env.JWT_ISSUER || 'default_issuer',
                subject: customerId.toString()
            }
        );

        const refreshToken = crypto.randomBytes(128).toString('base64');

        await RefreshToken.create({
            userId: customerId,
            token: refreshToken,
            expiresAt: Date.now() + (process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || 30 * 24 * 60 * 60 * 1000)
        });

        return res.status(200).json({
            accessToken,
            tokenType: process.env.JWT_ACCESS_TOKEN_TYPE || 'Bearer',
            accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '1h',
            refreshToken,
            refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || 30 * 24 * 60 * 60 * 1000
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err });
    }
};


/**
 * Kill customer session
 * @returns {object} message
 */

authController.logoutCustomer = async (req, res) => {
    try {
        const userId = req.user.id;

        await RefreshToken.destroy({
            where: { userId: userId },
        });

        req.user = null

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
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
            email,
            id: crypto.randomUUID()
        });

        await newPressing.save();

        const newCoordinate = new Coordinate({
            userId: newPressing.id,
            category: "PRESSING",
            lat,
            long,
        })

        await newCoordinate.save()

        res.status(200).json({ message: 'Pressing account created succesfully' })

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
        const userId = req.user.id;

        await RefreshToken.destroy({
            where: { userId: userId },
        });

        req.user = null

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = authController;


authController.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        const existingToken = await RefreshToken.findOne({ where: { token: refreshToken } });

        if (!existingToken) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const customer = await Customer.findByPk(existingToken.userId);

        if (!customer) {
            return res.status(401).json({ message: 'User not found' });
        }

        const accessToken = jwt.sign(
            { 
                id: customer.id, 
                email: customer.email, 
            },
            process.env.JWT_SECRET || 'secret',
            {
                algorithm: process.env.JWT_ALG || 'HS256',
                audience: process.env.JWT_AUDIENCE || 'default_audience',
                expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '3600',
                issuer: process.env.JWT_ISSUER || 'default_issuer',
                subject: customer.id.toString(),
            }
        );

        const newRefreshToken = crypto.randomBytes(128).toString('base64');

        await existingToken.update({
            token: newRefreshToken,
            expiresAt: Date.now() + process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || (24 * 60 * 60 * 1000),
        });

        return res.status(200).json({
            accessToken,
            tokenType: process.env.JWT_ACCESS_TOKEN_TYPE || 'Bearer',
            accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '3600',
            refreshToken: newRefreshToken,
            refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || (24 * 60 * 60),
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};