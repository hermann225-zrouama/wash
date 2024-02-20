const washClothesRequestModel = require('../models/washClothesRequest.model');
const coreAlgo = require('../core/coreAlgo.js');
const tarification = require('../core/tarification.js');
const client = require('../models/client.model');
const coordinate = require('../models/coordinate.model.js');
const clientController = require('./client.controller.js');

// create controller
const washClothesRequestController = {};

/**
 * Create a new wash clothes request
 * @param {string} clientId
 * @param {string} clientLat
 * @param {string} clientLong
 * @param {string} tshirt
 * @param {string} pantalon
 * @param {string} chemise
 * @param {string} veste
 * @returns {object} washClothesRequest
 * @throws {Error} error
 */
washClothesRequestController.createWashClothesRequest = async (req, res) => {
    try{
        const request = req.body;

        const price = tarification(request);

        if(price === 0 || !request){
            return res.status(400).json({ message:"requête vide" })
        }

        const userId = req.session.user.id
        let clientCoordonate = await clientController.getCoordinate(userId)
        
        const clientLat = clientCoordonate.lat
        const clientLong = clientCoordonate.long

        clientCoordonate = { lat: clientLat, long: clientLong };
        console.log(clientCoordonate) 
        
        const bestPressing = await coreAlgo.determineBestPressingForWashClothesRequest(clientCoordonate);

        if(!bestPressing){
            return res.status(400).json({ message: 'Aucun pressing disponible' });
        }

        const newWashClothesRequest = new washClothesRequestModel({
            date: new Date(),
            washClothesRequestItems: request,
            price: price,
            pressingId: bestPressing.id,
            clientId: userId,
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