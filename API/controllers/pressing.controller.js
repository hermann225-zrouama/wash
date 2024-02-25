const Pressing = require('../models/pressing.model');
const Coordinate = require("../models/coordinate.model")

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

        const existingPressing = await Pressing.findOne({ where: { id: id } });
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
        const existingPressing = await Pressing.findOne({ where: { id: pressingId } });
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
    try {
        const pressings = await Pressing.findAll();

        const pressingsCoordinatesPromises = pressings.map(async pressing => {
            const coordinates = await Coordinate.findOne({
                where: {
                    userId: pressing.id,
                    category: "PRESSING"
                },
            });

            return {
                id: pressing.id,
                name: pressing.name,
                lat: coordinates.lat,
                long: coordinates.long
            };
        });

        // Utiliser Promise.all pour attendre toutes les promesses générées par map
        const pressingsCoordinates = await Promise.all(pressingsCoordinatesPromises);

        return pressingsCoordinates;
    } catch (err) {
        console.error("Error while getting coordinates");
        console.error(err);
        throw err; // Rejeter l'erreur pour que l'appelant puisse la gérer
    }
};



pressingController.updateCoordinate = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { lat, long } = req.body;

        if (!lat || typeof lat !== 'number') {
            return res.status(400).json({ message: 'Invalid latitude', info: 'lat' });
        }

        if (!long || typeof long !== 'number') {
            return res.status(400).json({ message: 'Invalid longitude', info: 'long' });
        }

        let coordinates = await Pressing.findOne({
            where: {
                userId: userId,
                category: "PRESSING"
            },
        });

        if (!coordinates) {
            // If coordinates don't exist, you may choose to create them
            coordinates = await Pressing.create({
                userId: userId,
                lat: lat,
                long: long,
                category: "PRESSING"
            });

            return res.status(201).json({ message: 'Pressing coordinates created successfully.'});
        }

        // If coordinates exist, update them
        await coordinates.update({
            lat: lat,
            long: long,
        });

        return res.status(200).json({ message: 'Pressing coordinates updated successfully.'});

    } catch (error) {
        console.error(error);
    }
};


module.exports = pressingController;