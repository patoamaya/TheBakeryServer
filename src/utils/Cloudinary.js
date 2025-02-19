const cloudinary = require('cloudinary').v2
const {cloud_name, api_key, api_secret} = require('../credentials/Cloudinary')

cloudinary.config({ 
    cloud_name, 
    api_key, 
    api_secret 
});


module.exports = cloudinary