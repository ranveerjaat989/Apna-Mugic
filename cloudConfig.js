const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'crazy_DEV',
      //format: async (req, file) => '.audio/mp3', // supports promises as well
     allowerdFormats:["png","jpg","jpeg","audio/mp3"],
    
    },
  });

  module.exports={
    cloudinary,storage
  }