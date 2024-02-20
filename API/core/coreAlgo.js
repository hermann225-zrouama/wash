const pressingController = require('../controllers/pressing.controller');
const RADIUS_IN_KM = -1 || process.env.RADIUS_IN_KM;
const WASHING_TIME_IN_MINUTES = 60 || process.env.WASHING_TIME_IN_MINUTES;
const CUSTOMER_WASH_DELIVERY_TIME_IN_MINUTES = 60 * 48 || process.env.CUSTOMER_WASH_DELIVERY_TIME_IN_MINUTES;
const washClothesRequestModel = require('../models/washClothesRequest.model');

/**
 * Récupère le nombre de demandes en attente pour chaque pressing dans un tableau de pressings.
 *
 * @param {Array} pressingAroundClient - Tableau d'objets représentant les pressings.
 * @return {Promise<Array>} Une promesse résolue avec un tableau d'objets contenant l'ID du pressing et le nombre de demandes en attente.
 */

const retrieveRequestPerPressing = async (pressingAroundClient) => {
    try {
        const result = await Promise.all(pressingAroundClient.map(async pressing => {
            const requestCount = await washClothesRequestModel.count({
                where: { id: pressing.id, status: "PENDING" }
            });

            return { pressingId: pressing.id, requestCount };
        }));

        return result;
    } catch (err) {
        console.error(err);
        throw new Error("Failed to retrieve request counts per pressing.");
    }
};


/**
 * Détermine le pressing le plus proche du client.
 * @param {Array} requestPerPressing - Tableau d'objets contenant l'ID du pressing et le nombre de demandes en attente.
 * @return {Promise<Object>} Une promesse résolue avec un objet contenant les informations du pressing le plus proche du client.
 */

const determineBestPressing = async (requestPerPressing) => {
    const result = [];
    for (const req of requestPerPressing) {
        let count = req.requestcount?req.requestcount:0
        console.log("reqId", req.pressingId, "reqCount", count);
        if (count * WASHING_TIME_IN_MINUTES < CUSTOMER_WASH_DELIVERY_TIME_IN_MINUTES) {
            const pressingInfo = await pressingController.getPressingInfoById(req.pressingId);
            result.push(pressingInfo);
        }
    }
    return result;
}


/**
 * Calcule la distance entre deux coordonnées géographiques.
 * @param {Object} clientCoordinate - Objet contenant les coordonnées géographiques du client.
 * @param {Object} pressingCoordinate - Objet contenant les coordonnées géographiques du pressing.
 * @return {Number} La distance entre les deux coordonnées géographiques.
 * @see https://www.movable-type.co.uk/scripts/latlong.html
 * @see https://en.wikipedia.org/wiki/Haversine_formula
 */

const calcDistance = (clientCoordinate, pressingCoordinate) => {
    if (clientCoordinate.lat === pressingCoordinate.lat && clientCoordinate.long === pressingCoordinate.long) {
        return 0; // You may choose to return 0 or another suitable value
    }

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

// const returnClosePressing = async (clientCoordinate, pressingList) => {
//     const pressingsAroundClient = pressingList.filter(pressing => {
//         const distance = calcDistance(clientCoordinate, { lat: pressing.lat, long: pressing.long });
//         return distance <= RADIUS_IN_KM;
//     });
//     return pressingsAroundClient;
// }

/**
 * Récupère les coordonnées géographiques des pressings dans un rayon de recherche.
 * @param {Object} clientCoordinate - Objet contenant les coordonnées géographiques du client.
 * @param {Number} radiusInKm - Rayon de recherche en kilomètres.
 * @return {Promise<Array>} Une promesse résolue avec un tableau d'objets contenant les coordonnées géographiques des pressings.
 */

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


/**
 * Détermine le pressing optimal pour la requête du client.
 * @param {Object} clientCoordinate - Objet contenant les coordonnées géographiques du client.
 * @return {Promise<Object>} Une promesse résolue avec un objet contenant les informations du pressing le plus proche du client.
 */

const determineBestPressingForWashClothesRequest = async (clientCoordinate) => {
    try {
        const pressingAroundClient = await getPressingAroundClient(clientCoordinate, RADIUS_IN_KM);
        const requestPerPressing = await retrieveRequestPerPressing(pressingAroundClient);
        const bestPressing = await determineBestPressing(requestPerPressing);
        const randomPressing = Math.floor(Math.random() * bestPressing.length);
        best = bestPressing[randomPressing];
        return best
    } catch (err) {
        console.log(err);
    }
};

const coreAlgo = {};
coreAlgo.determineBestPressingForWashClothesRequest = determineBestPressingForWashClothesRequest;

module.exports = coreAlgo;