const washClothesRequestModel = require('../models/washClothesRequest.model');
const DetermineBestPressingForWashClotheRequest = require('../core/calcDistance.js');
const tarification = require('../core/tarification.js');

// create controller
const washClothesRequestController = {};

washClothesRequestController.createWashClothesRequest = async (req, res) => {
    try{
        const { clientId, clientLat, clientLong, } = req.body;

        const clothesRequestItems = {
            "T-shirt": 2,
            "Pantalon": 2,
            "Chemise": 25,
            "Veste": 5,
            "Autre":3 
        }

        let clientCoordonate = { lat: clientLat, long: clientLong };
        let bestPressing = await DetermineBestPressingForWashClotheRequest(clientCoordonate);
        let price = tarification(clothesRequestItems);

        const newWashClothesRequest = new washClothesRequestModel({
            date: new Date(),
            status: "pending",
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