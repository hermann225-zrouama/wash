const washClothesRequestModel = require('../models/washClothesRequest.model');
const coreAlgo = require('../core/coreAlgo.js');
const tarification = require('../core/tarification.js');

// create controller
const washClothesRequestController = {};

washClothesRequestController.createWashClothesRequest = async (req, res) => {
    try{
        const { clientId, clientLat, clientLong, } = req.body;

        const clothesRequestItems = {
            "TSHIRT": 2,
            "PANTALON": 2,
            "CHEMISE": 25,
            "VESTE": 5,
        }

        let clientCoordonate = { lat: clientLat, long: clientLong };
        let bestPressing = await coreAlgo.determineBestPressingForWashClothesRequest(clientCoordonate);

        if(!bestPressing){
            return res.status(400).json({ message: 'Aucun pressing disponible' });
        }

        let price = tarification(clothesRequestItems);

        const newWashClothesRequest = new washClothesRequestModel({
            date: new Date(),
            status: "PENDING",
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