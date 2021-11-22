const express = require("express");
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const tweetRoutes = require('./routes/tweets')
const passport = require('passport')
const passportConfig = require('./config/passport')
const cloudinary = require('cloudinary').v2;
const app = express();

module.exports = (io) =>{
  
  app.use(express.json({
    limit: '50mb'
  }));
  
  app.use(express.urlencoded({
    limit: '50mb', 
  }));
  
  passportConfig(passport)
  app.use(passport.initialize())

  app.use((req,res,next)=>{
    req.io = io;
    next()
  })
  app.use('/app',userRoutes);
  app.use('/app',tweetRoutes);
  app.use('/app',authRoutes(cloudinary));

 
  app.use((req,res,next)=>{
    const error = new Error("URL not found");
    error.status = 400
    next(error)
  })

  app.use((error,req,res,next)=>{
    const {message} = error;
    res.status(error.status||500)
    res.json({
      error:{
        message
      }
    })
  })

  
  return app
}

