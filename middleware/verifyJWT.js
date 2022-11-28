const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = (req,res,next) =>{
  const auth = req.get('Authorization');
  if (!auth) return res.sendStatus(401);
  const token = auth.split(' ')[1];
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err,decoded)=>{
      if (err) return res.sendStatus(401);
      console.log('MIDDLEWARE')
      req.user = {...decoded};
      next(); 
    })

}