const express = require('express')
const OwnerController = require('../controllers/OwnerController')
const router = express.Router()
const upload = require('../middleware/Storage')

// Vistas de vendedor
router.get('/', OwnerController.home)

router.get('/q', OwnerController.q)

router.get('/detail/:id', OwnerController.detail)

router.delete('/delete/:id', OwnerController.delete)

router.patch('/update/:id', upload.array('imagenes', 2), OwnerController.update)

router.post('/add', upload.array('imagenes', 2), OwnerController.add)






module.exports = router