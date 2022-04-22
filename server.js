const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const tweetRoutes = require('./routes/tweets')
const {socketConfig} = require('./routes/socket')
const app = express();

const passport = require('passport')
const passportConfig = require('./config/passport')
const GridFsStorage = require('multer-gridfs-storage');
const multer = require('multer')
const morgan = require('morgan')
const cors = require("cors")
const config = require("./config/keys")
const port = process.env.PORT || 5000; 
//const httpServer = require("http").createServer(app(io))
// const io = require("socket.io")(httpServer,{
//   cors: {
//     origin: "http://localhost:3000/", 
//   }
// }) 

const chalk = require('chalk');
const httpServer = require("http").createServer(app)
const io =  require("socket.io")(httpServer,{
  cors:{
    origin:"*",
  }
})


// Bodyparser middleware
app.use(express.json({
  limit: '50mb'
}));

app.use(express.urlencoded({
  limit: '50mb', 
}));

// Initialize Passport
app.use(passport.initialize())
// Passport Config
passportConfig(passport)
// DB Config
const db = require("./config/keys").mongoURI;

socketConfig(io)

app.use((req,res,next)=>{
  req.io = io;
  next()
}) 
app.use(cors())
// app.use((req,res,next)=>{ 
//   res.header('Access-Control-Allow-Origin',"http://localhost:3000")
//   res.header('Access-Control-Allow-Headers','*')
//   next()
// })

app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    chalk.green(tokens.status(req, res)),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
})
)

app.get('/',(req,res)=>{
  res.send("<h2 style='font-family: monospace;'> REST API for Twitter Clone </h2>")
})

app.use('/app',userRoutes,tweetRoutes,authRoutes);

app.use((req,res,next)=>{
  const error = new Error("URL not found");
  error.status = 404;
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
// Connect to MongoDB
mongoose.set('useFindAndModify', false)
mongoose
.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("MongoDB successfully connected"))
.catch((err) => console.log(err));

httpServer.listen(port,()=>console.log(`Server up and running on port ${port} !`))

 

