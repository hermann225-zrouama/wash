const pressing = require('../models/pressing.model');
const bcrypt = require("bcrypt")

// create controller
const pressingController = {};
const saltRounds = 10

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
pressingController.createPressing = async (req, res) => {
    try{
        const { name, lat, long, phoneNumber,password, address } = req.body;

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
            address
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
pressingController.authenticatePressing = async (req, res) => {
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
 * Get pressing by id
 * @param {string} id
 * @returns {object} pressing
 * @throws {Error} error
 */
pressingController.getPressing = async (req, res) => {
    try{
        const { id } = req.params;

        const existingPressing = await pressing.findOne({ where: { id: id } });
        if (!existingPressing) {
            return res.status(400).json({ message: 'Pressing does not exist' });
        }

        const { password: pressingPassword, id: pressingId, ...pressingWithoutPassword } = existingPressing.dataValues;

        res.status(200).json(pressingWithoutPassword);

    }catch(err){
        console.log(err);
        return res.status(500).json({ message: err });
    }
}

/**
 * Get information of pressing by id
 * @returns {String} pressing's id
 * @throws {Error} error
 */
pressingController.getPressingInfoById = async (pressingId) => {
    try{
        const existingPressing = await pressing.findOne({ where: { id: pressingId } });
        if (!existingPressing) {
            return res.status(400).json({ message: 'Pressing does not exist' });
        }

        return existingPressing.dataValues;

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
pressingController.logoutPressing = async (req, res) => {
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

/**
 * Get coordinates of all pressings
 * @returns {Array} pressingsCoordinates
 * @throws {Error} error
 */
pressingController.getPressingCoordinates = async () => {
    try{
        const pressings = await pressing.findAll();

        const pressingsCoordinates = pressings.map(pressing => {
            return {
                id: pressing.id,
                name: pressing.name,
                lat: pressing.lat,
                long: pressing.long
            }
        });
        return pressingsCoordinates;

    }catch(err){
        console.log("get coordinates error");
        console.log(err);
    }
}



module.exports = pressingController;