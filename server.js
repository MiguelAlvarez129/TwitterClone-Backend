const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require('./routes/auth.routes')
const tweetRoutes = require('./routes/tweet.routes')
const userRoutes = require('./routes/user.routes')
const {socketConfig} = require('./routes/socket')
const app = express();
const fs = require('fs').promises
const morgan = require('morgan')
const cors = require("cors")
const port = process.env.PORT || 5000; 
const cookieParser = require("cookie-parser");
const verifyJWT = require("./middleware/verifyJWT");
const path = require("path");
const httpServer = require("http").createServer(app)
const io =  require("socket.io")(httpServer,{
  cors:{
    origin:"http://localhost:3000", 
  }
})

// Bodyparser middleware
app.use(express.json());

app.use(express.urlencoded());

app.use(cookieParser());


// DB Config
const db = require("./config/keys").mongoURI;

socketConfig(io)

app.use((req,res,next)=>{
  req.io = io;
  next()
}) 

app.use(cors({
  origin:'http://localhost:3000',
  credentials: true,
}))

app.use(morgan(require("./config/morgan.config")))

app.get('/',(req,res)=>{
  res.send("<h2 style='font-family: monospace;'> REST API for Twitter Clone </h2>")
})

app.use(async (req,res,next) => { 
  if(/\/public\/uploads\/[0-9a-z]+\/profile/.test(req.path)){
    console.log(req.path, 'PATH')
    const imagePath = req.path.split(/(profile|bg)\./)
    const files = await fs.readdir(path.join( __dirname,imagePath[0]))
    console.log(files,imagePath)
    const fileName = files.find(e => e.includes(imagePath[1]))
    console.log(fileName)
    if (fileName !== undefined){
      console.log(req.url,imagePath[0] + fileName)
      req.url = imagePath[0] + fileName
      // res.setHeader('Cache-Control', 'public, max-age=0, no-cache, no-store')
      // console.log(imagePath[0] + fileName)
    }
    // req.path = imagePath[0] + 
  }
  // if (req.path.includes('profile')){
  //   res.setHeader('Cache-Control', 'public, max-age=0, no-cache, no-store')
  // }
  next()
}) 

app.use('/public/uploads',express.static('public/uploads/',{

}))

// const cacheControl = (res,path) =>{
//   if (path.includes('profile')){

//     console.log('here')
//     res.setHeader('Cache-Control', 'public, max-age=0, no-cache, no-store')
//   }

// }

// app.use(serveStatic(path.join(__dirname,'public/uploads/'),{
//   setHeaders: cacheControl
// }))
app.use('/app',authRoutes);
app.use(verifyJWT);
app.use('/app',tweetRoutes,userRoutes);

app.use((req,res,next)=>{
  const error = new Error("URL not found");
  error.status = 404;
  next(error)
})

app.use((error,req,res,next)=>{
  const {message} = error;
  res.status(error.status||500).json({
    error:{
      message
    }
  })
})
// Connect to MongoDB
mongoose.set('useFindAndModify', false)
mongoose
.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("MongoDB successfully connected"))
.catch((err) => console.log(err));

httpServer.listen(port,()=>console.log(`Server up and running on port ${port} !`))

 

