const mongoose = require('mongoose')

const Schema = mongoose.Schema

const cakeModel = Schema({
        precio: {type: Number},
        nombre: {type: String, required: true},
        tamano: {type: Number},
        descripcion: {type: String, required: true},
        rinde: {type: Number, required: true},
        categoria: {type: String, required: true}, 
        imagenes: [{ url: String, public_id: String }], 
        createdAt: {type: Date, default: Date.now} 

})

module.exports = mongoose.model('cakes', cakeModel)