const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model')

const secret = process.env.JWT_SECRET || "secret"
const algorithm = process.env.JWT_ALG || 'HS256'

async function auth(req, res, next) {
    try {
        const { headers } = req;

        if (!headers || !headers.authorization) {
            return res.status(401).json({
                message: 'Missing Authorization header'
            });
        }

        const [scheme, token] = headers.authorization.split(' ');

        if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
            return res.status(401).json({
                message: 'Header format is Authorization: Bearer token'
            });
        }

        const decodedToken = jwt.verify(token, secret, {
            algorithms: algorithm
        });

        const userId = decodedToken.sub;
        const user = await Customer.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(401).json({
                message: `User ${userId} not exists`
            });
        }

        req.user = user;

        return next();

    } catch (err) {
        return res.status(401).json({
            message: 'Invalid token'
        });
    }
}

module.exports = auth