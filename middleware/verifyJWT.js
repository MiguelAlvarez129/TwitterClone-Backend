const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = (req,res,next) =>{
  const auth = req.get('authorization');
  if (!auth) res.sendStatus(401);
  console.log(auth)
  const token = auth.split(' ')[1];
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err,decoded)=>{
      if (err) return res.sendStatus(403);
      req.user = {...decoded};
      next();
    })

}