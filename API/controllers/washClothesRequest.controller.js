const washClothesRequestModel = require('../models/washClothesRequest.model');
const coreAlgo = require('../core/coreAlgo.js');
const tarification = require('../core/tarification.js');
const customerController = require('./customer.controller.js');
const crypto = require("crypto")

// create controller
const washClothesRequestController = {};

function isValidRequest(request) {
    if (typeof request !== 'object' || request === null || Array.isArray(request)) {
        return false;
    }
    const requestModel = {
        "TSHIRT": 0,
        "PANTALON": 0,
        "CHEMISE": 0,
        "VESTE": 0,
        "DRAP": 0
    };
    const validKeys = Object.keys(requestModel);

    const requestKeys = Object.keys(request);
    const isValidKeys = requestKeys.every(key => validKeys.includes(key));

    if (!isValidKeys) {
        return false;
    }

    const isValidValues = requestKeys.every(key => typeof request[key] === 'number');

    return isValidValues;
}

/**
 * Create a new wash clothes request
 * @param {string} customerId
 * @param {string} customerLat
 * @param {string} customerLong
 * @param {string} tshirt
 * @param {string} pantalon
 * @param {string} chemise
 * @param {string} veste
 * @returns {object} washClothesRequest
 * @throws {Error} error
 */
washClothesRequestController.createWashClothesRequest = async (req, res) => {
    try{
        const {request, lat, long} = req.body;

        if(!isValidRequest(request)){
            return res.status(400).json({ message:"bad request object",info:'request' })
        }

        const price = tarification(request);

        if(price === 0 || !request){
            return res.status(400).json({ message:"request empty", info:"request" })
        }

        const userId = req.user.id
        
        customerCoordinate = { lat: lat, long: long };
        console.log(customerCoordinate) 
        
        const bestPressing = await coreAlgo.determineBestPressingForWashClothesRequest(customerCoordinate);

        if(!bestPressing){
            return res.status(400).json({ message: 'Aucun pressing disponible' });
        }

        const newWashClothesRequest = new washClothesRequestModel({
            date: new Date(),
            washClothesRequestItems: request,
            price: price,
            pressingId: bestPressing.id,
            customerId: userId,
            id: crypto.randomUUID()
        });

        await newWashClothesRequest.save();

        res.status(201).json(newWashClothesRequest);

    }catch(err){
        console.log(err);
        return res.status(500).json({ message: err });
    }
}

washClothesRequestController.getPrice = async (req,res) =>{
    try {
        const price = tarification(req.body);

        return res.status(200).json({price: price})

    } catch (error) {
        console.log(error)
        res.status(500).json({message: "erreur get price"})
    }
}


module.exports = washClothesRequestController;