const clothesCategoryBindingPrices = {
    "TSHIRT": 100,
    "PANTALON": 100,
    "CHEMISE": 100,
    "VESTE": 100,
    "DRAP": 100
}

const tarification = (clothesRequestItems)=>{
    let total = 0;
    for (const [key, value] of Object.entries(clothesRequestItems)) {
        total += value * clothesCategoryBindingPrices[key];
    }
    return total;
}

module.exports = tarification;