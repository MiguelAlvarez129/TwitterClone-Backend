const cloudinary = require('cloudinary').v2;

// Cloudinary config 

cloudinary.config({ 
  cloud_name: process.env.CLOUD, 
  api_key: process.env.APIKEY, 
  api_secret: process.env.APISECRET
});

const uploader = (file,obj) =>{
  return new Promise((resolve)=>{
    cloudinary.uploader.upload(file,obj,(error,result)=>{
      console.log(error,result)
      resolve({fileId:result.public_id})
    }) 
  })
}

const downloader = (file) =>{
  return new Promise((resolve,reject)=>{
    cloudinary.api.resource(file.fileId,(error,result)=>{
      if (error) {
        if (error.http_code === 404 || 420){
          resolve(false)
        } else {
          reject(error)
        }
      } else {
        resolve({pic:result.secure_url,width:result.width,height:result.height})
      }
    })
  })
}

module.exports = {
  cloudinary,
  uploader,
  downloader,
}