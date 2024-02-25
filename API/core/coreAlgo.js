const pressingController = require('../controllers/pressing.controller');
const RADIUS_IN_KM = 10000000 || process.env.RADIUS_IN_KM;
const WASHING_TIME_IN_MINUTES = 60 || process.env.WASHING_TIME_IN_MINUTES;
const CUSTOMER_WASH_DELIVERY_TIME_IN_MINUTES = 60 * 48 || process.env.CUSTOMER_WASH_DELIVERY_TIME_IN_MINUTES;
const WashClothesRequestModel = require('../models/washClothesRequest.model');

const coreAlgo = {};

const retrieveRequestPerPressing = async (pressingAroundClient) => {
    try {
        const result = await Promise.all(pressingAroundClient.map(async pressing => {
            const requestCount = await WashClothesRequestModel.count({
                where: { pressingId: pressing.id, status: "PENDING" }
            });
            return { pressingId: pressing.id, requestCount };
        }));
        return result;
    } catch (err) {
        console.error(err);
        throw new Error("Failed to retrieve request counts per pressing.");
    }
};

const determineBestPressing = async (requestPerPressing) => {
    const result = [];

    for (const req of requestPerPressing) {
        const count = req.requestCount || 0;
        console.log("reqId", req.pressingId, "reqCount", count);

        if (count * WASHING_TIME_IN_MINUTES < CUSTOMER_WASH_DELIVERY_TIME_IN_MINUTES) {
            const pressingInfo = await pressingController.getPressingInfoById(req.pressingId);
            result.push(pressingInfo);
        }
    }

    return result;
};

const calcDistance = (clientCoordinate, pressingCoordinate) => {
    const R = 6371e3;
    const φ1 = clientCoordinate.lat * Math.PI / 180;
    const φ2 = pressingCoordinate.lat * Math.PI / 180;
    const Δφ = (pressingCoordinate.lat - clientCoordinate.lat) * Math.PI / 180;
    const Δλ = (pressingCoordinate.long - clientCoordinate.long) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    return d / 1000;
};

const getPressingAroundClient = async (clientCoordinate, radiusInKm) => {
    try {
        const pressingsCoordinates = await pressingController.getPressingCoordinates();
        const closePressing = pressingsCoordinates.filter(pressing => calcDistance(clientCoordinate, pressing) <= radiusInKm);

        if (closePressing.length === 0) {
            return getPressingAroundClient(clientCoordinate, radiusInKm + 1);
        } else {
            return closePressing;
        }
    } catch (err) {
        console.error(err);
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

coreAlgo.determineBestPressingForWashClothesRequest = determineBestPressingForWashClothesRequest;

module.exports = coreAlgo;
