const CakeModel = require("../models/CakeModel")
const streamifier = require ("streamifier");
const cloudinary = require("../utils/Cloudinary")


const OwnerController = {

home: async(req, res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    try{
        const findAll = await CakeModel.find()
        .skip((page-1) * limit)
        .limit(limit)

        const totalCakes = await CakeModel.countDocuments()


        res.json({
            findAll,
            totalPages: Math.ceil(totalCakes / limit),
            currentPage: page
        })
    }catch(err){
        res.status(500) || res.status(400)
        .json({
            message: `No se encontraron los productos`,
            error: err
        })
    }
    
},

q: async(req, res) =>{
    try{
    const {categoria} = req.query
    const filteredCategory = await CakeModel.find({categoria: categoria})
    res.send(filteredCategory)
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
            message: `No se ha encontrado el producto : ${err}`,
            error: err
        })
    }
},
    
add: async(req, res)=>{
        try{
            const {precio, nombre, tamano, descripcion, rinde, categoria}  = req.body
            
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ message: 'Debe agregar imágenes' })
            }
            
            const imagenUrls = []
            
            for (const file of req.files) {
            const result = await new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'auto' }, 
                (error, result) => {
                  if (error) {
                      console.error('Error subiendo imagen a Cloudinary:', error)
                      reject(error)
                    }
                    resolve(result)
                }
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream)
        })
      
            imagenUrls.push({
              url: result.secure_url,  
              public_id: result.public_id 
            })
          }
        const newCake = new CakeModel({
            precio,
            nombre,
            tamano,
            descripcion,
            rinde,
            categoria,
            imagenes: imagenUrls
            
        })
        
        await newCake.save()
        res.status(200).json({
        message: "Producto añadido con exito"
    })
    }
    catch(err){
    console.error(`Error: ${err}`)
    res.status(500).json({
        message:"Error al añadir producto",
        error: err.message,
    })
    }
},

update: async (req, res) => {
    const _id = req.params.id;
    const { precio, categoria, tamano, descripcion, rinde, nombre } = req.body;
  
    const existingCake = await CakeModel.findById(_id);
    let ultimateImages = existingCake ? existingCake.imagenes : [];
  
    if (existingCake && existingCake.imagenes) {
      await Promise.all(existingCake.imagenes.map(async (img) => {
        try {
          await cloudinary.uploader.destroy(img.public_id);
          console.log(`Imagen eliminada de Cloudinary: ${img.public_id}`);
        } catch (err) {
          console.log("Error al eliminar imagen de Cloudinary:", err);
        }
      }));
    }
  
    if (!req.files || req.files.length === 0) {
      ultimateImages = existingCake.imagenes; // Mantener las imágenes anteriores
    } else {
      try {
        const imageUrls = await Promise.all(
          req.files.map((file) => {
            return new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'auto' },
                (err, result) => {
                  if (err) {
                    console.log("Error al subir imagen a Cloudinary:", err);
                    reject(err);
                  }
                  console.log("Imagen subida con éxito a Cloudinary:", result);
                  resolve({
                    url: result.secure_url,
                    public_id: result.public_id
                  });
                }
              );
              streamifier.createReadStream(file.buffer).pipe(uploadStream);
            });
          })
        );
  
        console.log("Imagenes subidas correctamente:", imageUrls);
        ultimateImages = [...imageUrls]; // Reemplazamos las imágenes anteriores por las nuevas
      } catch (err) {
        console.log("Error al subir imágenes a Cloudinary:", err);
        return res.status(500).json({ message: "Error al subir imágenes" });
      }
    }
  
    ultimateImages = ultimateImages.filter(img => img && img.url && img.public_id);
  
    const updatedCake = {
      nombre,
      tamano,
      rinde,
      descripcion,
      categoria,
      precio,
      imagenes: ultimateImages,
    };
  
    try {
      const updatedCakeDoc = await CakeModel.findOneAndUpdate({ _id }, updatedCake, { new: true });
      res.status(200).json({ message: 'Producto actualizado con éxito', updatedCake: updatedCakeDoc });
    } catch (error) {
      console.log("Error al actualizar el producto:", error);
      res.status(500).json({ message: 'Error al actualizar el producto' });
    }
  },
  
    
delete: async(req, res)=>{
     const _id = req.params.id
        try{
            const cake = await CakeModel.findById(_id)
                    if(!cake){
                        return res.status(404).json({
                            message: "Producto no encontrado"
                        })}
                            if(cake.imagenes && cake.imagenes.length > 0){
                                    for(let img of cake.imagenes){
                                        await cloudinary.uploader.destroy(img.public_id)
            }
        }
        const deleteOneById = await CakeModel.deleteOne({_id})
        res.status(200).json({
                message: "Producto eliminado con exito", deleteOneById
            })
        }
        catch(err){
            console.error(err)
            res.status(500).json({
                message: "Error al eliminar el producto",
                error: err
            })
        }
        
}
    
}
    
    module.exports = OwnerController