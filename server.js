const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require('./routes/auth.routes')
const tweetRoutes = require('./routes/tweet.routes')
const userRoutes = require('./routes/user.routes')
const {socketConfig} = require('./routes/socket')
const app = express();

const morgan = require('morgan')
const cors = require("cors")
const port = process.env.PORT || 5000; 
const cookieParser = require("cookie-parser");
const verifyJWT = require("./middleware/verifyJWT");
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


app.use('/public/uploads',express.static('public/uploads/'))
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

 

