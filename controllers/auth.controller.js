const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authController = {}


authController.register = async (req,res) =>{
  try {
    const { email, password, fullname } = req.body,
    username = req.body.username.substring(1).toLowerCase(),
    errors = {},
    user = await User.findOne({ $or: [{ username }, { email }] }).exec()
    
    if (user){
      if (user.username == username) {
        errors.username = "Username is already taken";
      }
      if (user.email == email) {
        errors.email = "Email is already taken"
      }
      return res.status(409).json(errors);
    } else {
      const user = await new User({
                email,
                username,
                password,
                fullname,
              })
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) throw err;
        user.password = hash;
        user
          .save()
          .then(() => res.send({msg:"You have been registered successfully"}))
          .catch((err) => console.log(err));
      });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

authController.login = async (req,res) =>{
  const { password } = req.body;
  const username = req.body.username.substring(1).toLowerCase()
  const user = await User.findOne({username}).exec()

  if (!user){
    res.status(404).send("Username doesn't exist")
  } else {
    const match = await bcrypt.compare(password, user.password)
    if (match){
      const payload = {
        username: user.username,
        id: user.id,
        fullname:user.fullname,
        profilePic: user.profilePic
      };
      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn:process.env.EXPIRE_TOKEN_TIME});
      const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn:"1d"});

      user.access_token = accessToken
      user.refresh_token = refreshToken

      await user.save()
      res.cookie('jwt',refreshToken,{httpOnly: true, maxAge: 60 * 60 * 24 * 1000})
      res.json({accessToken, ...payload})

    } else {
      res.status(400).send("Incorrect password");
      
    }
  }
}

authController.refreshToken = async (req,res) => {
  const {jwt:token} = req.cookies;
  // console.log('REFRESH',token)
  if (token === undefined) return res.sendStatus(403)
  const user = await User.findOne({refresh_token:token}).exec();
  // console.log('REFRESH 401',user)
  if (!user) return res.sendStatus(403)
  jwt.verify(token,process.env.REFRESH_TOKEN_SECRET, async (err,decoded)=>{
    if (err) return res.sendStatus(400);
    const {username,id} = decoded;
    const {profilePic,fullname} = await User.findOne({_id:id}).exec()
    
    const accessToken = jwt.sign({username,id,fullname,profilePic}, process.env.ACCESS_TOKEN_SECRET, {expiresIn:"30s"});
    res.send({accessToken,...decoded,profilePic,fullname})
  })
}
  

module.exports = authController