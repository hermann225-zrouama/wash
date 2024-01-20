
let clothesCategoryBindingPrices = {
    "T-shirt": 200,
    "Pantalon": 200,
    "Chemise": 250,
    "Veste": 500,
    "Autre":300 
}

const tarification = (clothesRequestItems)=>{
    let total = 0;
    for (const [key, value] of Object.entries(clothesRequestItems)) {
        total += value * clothesCategoryBindingPrices[key];
    }
    return total;
}

module.exports = tarification;