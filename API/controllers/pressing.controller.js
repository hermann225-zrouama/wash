const pressing = require('../models/pressing.model');
const bcrypt = require("bcrypt")

// create controller
const pressingController = {};

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

        const { password: pressingPassword, id: pressingId, ...pressingWithoutPassword } = existingpressing.dataValues;

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


pressingController.getCoordinate = async (req, res) => {
    try {
        const userId = req.session.user.id;

        // Assuming you have a Sequelize model named 'Pressing'
        const coordinates = await pressing.findOne({
            where: {
                userId: userId,
                pressing: "PRESSING"
            },
        });

        if (!coordinates) {
            return res.status(404).json({ message: 'Pressing coordinates not found for the user.' });
        }

        // If coordinates are found, you can send them in the response
        return res.status(200).json({ coordinates: coordinates });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

pressingController.updateCoordinate = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { latitude, longitude } = req.body;

        // Assuming you have a Sequelize model named 'Pressing'
        let coordinates = await pressing.findOne({
            where: {
                userId: userId,
                category: "PRESSING"
            },
        });

        if (!coordinates) {
            // If coordinates don't exist, you may choose to create them
            coordinates = await pressing.create({
                userId: userId,
                latitude: latitude,
                longitude: longitude,
                category: "PRESSING"
            });

            return res.status(201).json({ message: 'Pressing coordinates created successfully.', coordinates: coordinates });
        }

        // If coordinates exist, update them
        await coordinates.update({
            latitude: latitude,
            longitude: longitude,
        });

        return res.status(200).json({ message: 'Pressing coordinates updated successfully.', coordinates: coordinates });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};


module.exports = pressingController;