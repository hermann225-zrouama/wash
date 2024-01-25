let clothesCategoryBindingPrices = {
    "TSHIRT": 0,
    "PANTALON": 0,
    "CHEMISE": 0,
    "VESTE": 0,
    "DRAP": 0
}

const tarification = (clothesRequestItems)=>{
    let total = 0;
    for (const [key, value] of Object.entries(clothesRequestItems)) {
        total += value * clothesCategoryBindingPrices[key];
    }
    return total;
}

module.exports = tarification;