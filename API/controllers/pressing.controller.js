const pressing = require('../models/pressing.model');
const bcrypt = require("bcrypt")

// create controller
const pressingController = {};
const saltRounds = 10

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