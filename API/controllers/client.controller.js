const client = require('../models/client.model');
const coordinate = require("../models/coordinate.model")
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


clientController.UpdateClient = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber } = req.body;

        // Verification of phone number
        const regex = new RegExp("^[0-9]{10}$");
        if (!regex.test(phoneNumber)) {
            return res.status(400).json({ message: 'Vérifier votre numéro de téléphone' });
        }

        // Verification of email
        const mailRegex = new RegExp("^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]{2,}\.[a-z]{2,4}$");
        if (!mailRegex.test(email)) {
            return res.status(400).json({ message: 'Vérifier votre adresse email' });
        }

        // Get client ID from session
        const id = req.session.user.id;

        // Find the client to update
        const clientToUpdate = await client.findOne({
            where: {
                id: id,
            },
        });

        if (!clientToUpdate) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Perform the update
        const [rowsAffected, updatedClients] = await client.update(
            { lastName: lastName, firstName: firstName, email: email },
            {
                where: {
                    id: id,
                },
            }
        );

        if (rowsAffected === 0) {
            return res.status(404).json({ message: 'Client not found or no changes applied' });
        }

        // Return success response
        return res.status(200).json({ message: 'Client updated successfully' });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

clientController.getCoordinate = async (id) => {
    try {
        // Assuming you have a Sequelize model named 'Coordinate'
        const coordinates = await coordinate.findOne({
            where: {
                userId: id,
                category: "CUSTOMER"
            },
        });

        if (!coordinates) {
            return res.status(404).json({ message: 'Coordinates not found for the user.' });
        }

        // If coordinates are found, you can send them in the response
        return coordinate
    } catch (err) {
        console.log(err)
    }
}


clientController.updateCoordinate = async (req, res) => {
    try {
        const id = req.session.user.id;
        const { latitude, longitude } = req.body;

        // Assuming you have a Sequelize model named 'Coordinate'
        let coordinates = await coordinate.findOne({
            where: {
                userId: id,
                category: "CUSTOMER"
            },
        });

        if (!coordinates) {
            // If coordinates don't exist, you may choose to create them
            coordinates = await coordinate.create({
                userId: id,
                latitude: latitude,
                longitude: longitude,
                category: "CUSTOMER"
            });

            return res.status(201).json({ message: 'Coordinates created successfully.', coordinates: coordinates });
        }

        // If coordinates exist, update them
        await coordinates.update({
            latitude: latitude,
            longitude: longitude,
        });

        return res.status(200).json({ message: 'Coordinates updated successfully.', coordinates: coordinates });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};



module.exports = clientController;