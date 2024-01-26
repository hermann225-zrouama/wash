const washClothesRequestModel = require('../models/washClothesRequest.model');
const coreAlgo = require('../core/coreAlgo.js');
const tarification = require('../core/tarification.js');

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
        const { clientId, clientLat, clientLong,tshirt,pantalon,chemise,veste } = req.body;

        const clothesRequestItems = {
            "TSHIRT": tshirt,
            "PANTALON": pantalon,
            "CHEMISE": chemise,
            "VESTE": veste,
        }

        const clientCoordonate = { lat: clientLat, long: clientLong };
        const bestPressing = await coreAlgo.determineBestPressingForWashClothesRequest(clientCoordonate);

        if(!bestPressing){
            return res.status(400).json({ message: 'Aucun pressing disponible' });
        }

        const price = tarification(clothesRequestItems);

        const newWashClothesRequest = new washClothesRequestModel({
            date: new Date(),
            washClothesRequestItems: clothesRequestItems,
            price,
            pressingId: bestPressing.id,
            clientId,
        });

        await newWashClothesRequest.save();

        res.status(201).json(newWashClothesRequest);

    }catch(err){
        console.log(err);
        return res.status(500).json({ message: err });
    }
}


module.exports = washClothesRequestController;