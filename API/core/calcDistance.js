const pressingController = require('../controllers/pressing.controller');

// Calculate the distance between two points
const calcDistance = (clientCoordonate, pressingCoordonate) => {
    let distance = Math.sqrt(Math.pow(pressingCoordonate.lat - clientCoordonate.lat, 2) + Math.pow(pressingCoordonate.long - clientCoordonate.long, 2));
    return distance;
}

const determineBestPressingForWashClotheRequest = async (clientCoordinate) => {
    try {
        const pressingCoordinates = await pressingController.getPressingCoordinates();

        let bestPressing = pressingCoordinates[0];
        let bestDistance = calcDistance(clientCoordinate, pressingCoordinates[0]);

        for (let i = 1; i < pressingCoordinates.length; i++) {
            let distance = calcDistance(clientCoordinate, pressingCoordinates[i]);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestPressing = pressingCoordinates[i];
            }
        }

        return bestPressing;
    } catch (error) {
        console.error('Error determining best pressing:', error);
        throw error;
    }
};


module.exports = determineBestPressingForWashClotheRequest;