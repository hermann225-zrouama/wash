const pressingController = require('../controllers/pressing.controller');
const RADIUS_IN_KM = 0 || process.env.RADIUS_IN_KM;
const WASHING_TIME_IN_MINUTES = 60 || process.env.WASHING_TIME_IN_MINUTES;
const CUSTOMER_WASH_DELIVERY_TIME_IN_MINUTES = 60 * 48 || process.env.CUSTOMER_WASH_DELIVERY_TIME_IN_MINUTES;
const washClothesRequestModel = require('../models/washClothesRequest.model');


const getRequestPerPressing = async (pressingId) => {
    try {
        const request = await washClothesRequestModel.count({ where: { id: pressingId, status: "PENDING" } });
        return request;
    } catch (err) {
        console.log(err);
    }
}

const retrieveRequestPerPressing = async (pressingAroundClient) => {
    const result = await Promise.all(pressingAroundClient.map(async pressing => {
        const request = await getRequestPerPressing(pressing.id);
        return { pressingId: pressing.id, requestcount: request };
    }));
    return result;
}


const determineBestPressing = async (requestPerPressing) => {
    const result = [];
    for (const req of requestPerPressing) {
        console.log("reqId", req.pressingId, "reqCount", req.requestcount);
        if (req.requestcount * WASHING_TIME_IN_MINUTES < CUSTOMER_WASH_DELIVERY_TIME_IN_MINUTES) {
            const pressingInfo = await pressingController.getPressingInfoById(req.pressingId);
            result.push(pressingInfo);
        }
    }
    return result;
}


const calcDistance = (clientCoordinate, pressingCoordinate) => {
    const R = 6371e3; // metres
    const φ1 = clientCoordinate.lat * Math.PI / 180; // φ, λ in radians
    const φ2 = pressingCoordinate.lat * Math.PI / 180;
    const Δφ = (pressingCoordinate.lat - clientCoordinate.lat) * Math.PI / 180;
    const Δλ = (pressingCoordinate.long - clientCoordinate.long) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres
    const distance = d / 1000; // in kilometres

    return distance;
}

const returnClosePressing = async (clientCoordinate, pressingList) => {
    const pressingsAroundClient = pressingList.filter(pressing => {
        const distance = calcDistance(clientCoordinate, { lat: pressing.lat, long: pressing.long });
        return distance <= RADIUS_IN_KM;
    });
    return pressingsAroundClient;
}

const getPressingAroundClient = async (clientCoordinate, radiusInKm) => {
    try {
        const pressingsCoordinates = await pressingController.getPressingCoordinates();

        const closePressing = pressingsCoordinates.filter(pressing => {
            const distance = calcDistance(clientCoordinate, pressing);
            console.log("distance", distance);
            return distance <= radiusInKm;
        });
        
        // si aucun pressing n'est trouvé dans le rayon de recherche augmenter le rayon de recherche
        if (closePressing.length === 0) {
            return getPressingAroundClient(clientCoordinate, radiusInKm + 1);
        } else {
            return closePressing;
        }
        
    } catch (err) {
        console.error(err); // Utilisation de console.error pour les erreurs
    }
};


const determineBestPressingForWashClothesRequest = async (clientCoordinate) => {
    try {
        const pressingAroundClient = await getPressingAroundClient(clientCoordinate, RADIUS_IN_KM);
        const requestPerPressing = await retrieveRequestPerPressing(pressingAroundClient);
        const bestPressing = await determineBestPressing(requestPerPressing);
        const randomPressing = Math.floor(Math.random() * bestPressing.length);

        return bestPressing[randomPressing];
    } catch (err) {
        console.log(err);
    }
};

const coreAlgo = {};
coreAlgo.determineBestPressingForWashClothesRequest = determineBestPressingForWashClothesRequest;

module.exports = coreAlgo;