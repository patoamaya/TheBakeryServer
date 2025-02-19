const CakeModel = require("../models/CakeModel")


const IndexController = {

all: async(req, res)=>{
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    try{
        const searchAll = await CakeModel.find()
        .skip((page-1) * limit)
        .limit(limit)

        const totalCakes = await CakeModel.countDocuments()

        res.json({
            searchAll,
            totalPages: Math.ceil(totalCakes / limit),
            currentPage: (page)
        })
    }catch(err) {
        console.error(`Error: ${err}`)
        res.status(500).json({
            message: `Error al encontrar productos`,
            error: err.message
        })
        
    }

},

q: async(req, res) =>{
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    try{
    const {categoria} = req.query

    const filteredCategory = await CakeModel.find({categoria: categoria})
    .skip((page-1) * limit)
    .limit(limit)
    
    const totalCakes = await CakeModel.countDocuments()

    res.json({
        filteredCategory,
        totalPages: Math.ceil(totalCakes / limit),
        currentPage: (page)
    })
    }catch(err){
        res.status(400).json({
            message: `Error al encontrar esta categoria`,
            error: err
        })
    }
},
detail: async(req, res)=>{
    try{
        let {id} = req.params
        const findById = await CakeModel.findById(id)
        res.send(findById)

    }catch(err){
        return res.status(400).json({
            message: `Error al encontrar el producto: ${err}`,
            error: err
        })
    }
    
}
}

module.exports = IndexController