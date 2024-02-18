const tarification = require('../core/tarification.js');

let globalcontroller = {}

globalcontroller.getPrice = async (req,res) =>{
    try {
        let { request } = req.body
        const price = tarification(request);

        return res.status(200).json({price: price})

    } catch (error) {
        console.log(error)
    }
}

module.exports = globalcontroller