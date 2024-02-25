const customer = require('../models/customer.model');
const Coordinate = require("../models/coordinate.model")

const customerController = {};

customerController.getCustomer = async (req, res) => {
    try {
        if (req.user) {
            return req.session.user;
        }

        return res.status(401).json({ message: "Authentication required" });

    } catch (error) {
        return res.status(500).json(error);
    }
}

customerController.updateCustomer = async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;

        // Verification of email
        const mailRegex = new RegExp("^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]{2,}\.[a-z]{2,4}$");
        if (!mailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email', info: 'email' });
        }

        if (!firstName || typeof firstName !== 'string') {
            return res.status(400).json({ message: 'Invalid first name', info: 'firstName' });
        }

        if (!lastName || typeof lastName !== 'string') {
            return res.status(400).json({ message: 'Invalid last name', info: 'lastName' });
        }

        // Get customer ID from session
        const id = req.user.id;

        // Find the customer to update
        const customerToUpdate = await customer.findOne({
            where: {
                id: id,
            },
        });

        if (!customerToUpdate) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Perform the update
        const [rowsAffected, updatedCustomers] = await customer.update(
            { lastName: lastName, firstName: firstName, email: email },
            {
                where: {
                    id: id,
                },
            }
        );

        if (rowsAffected === 0) {
            return res.status(404).json({ message: 'Customer not found or no changes applied' });
        }

        // Return success response
        return res.status(200).json({ message: 'Customer updated successfully' });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

customerController.getCoordinate = async (id) => {
    try {
        // Assuming you have a Sequelize model named 'Coordinate'
        const coordinates = await Coordinate.findOne({
            where: {
                userId: id,
                category: "CUSTOMER"
            },
        });

        if (!coordinates) {
            return res.status(404).json({ message: 'Coordinates not found for the user.' });
        }

        // If coordinates are found, you can send them in the response
        return coordinates;
    } catch (err) {
        console.log(err)
    }
}

customerController.updateCoordinate = async (req, res) => {
    try {
        const id = req.user.id;
        const { lat, long } = req.body;

        if (!lat || typeof lat !== 'number') {
            return res.status(400).json({ message: 'Invalid latitude', info: 'lat' });
        }

        if (!long || typeof long !== 'number') {
            return res.status(400).json({ message: 'Invalid longitude', info: 'long' });
        }

        // Assuming you have a Sequelize model named 'Coordinate'
        let coordinates = await Coordinate.findOne({
            where: {
                userId: id,
                category: "CUSTOMER"
            },
        });

        if (!coordinates) {
            // If coordinates don't exist, you may choose to create them
            coordinates = await Coordinate.create({
                userId: id,
                latitude: lat,
                longitude: long,
                category: "CUSTOMER"
            });

            return res.status(201).json({ message: 'Coordinates created successfully.', coordinates: coordinates });
        }

        // If coordinates exist, update them
        await coordinates.update({
            lat: lat,
            long: long,
        });

        return res.status(200).json({ message: 'Coordinates updated successfully.', coordinates: coordinates });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

module.exports = customerController;
