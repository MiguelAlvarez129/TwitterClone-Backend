const User = require('../models/User')
const bcrypt = require('bcrypt')
const authController = {}


authController.register = async (req,res) =>{
  try {
    const { email, password, fullname } = req.body,
    username = req.body.username.substring(1).toLowerCase(),
    errors = [],
    user = await User.findOne({ $or: [{ username }, { email }] }).exec()
    
    if (user){
      if (user.username == username) {
        errors.push("username");
      }
      if (user.email == email) {
        errors.push("email")
      }
      res.status(409).json(errors);
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
  
  // const { username, email, password, fullname } = req.body;
  // User.findOne({ $or: [{ username }, { email }] })
  //   .then((user) => {
  //     if (user) {
  //       console.log(user);
  //       let errors = {};
  //       if (user.username == username) {
  //         errors.username = "Username already exists";
  //       }
  //       if (user.email == email) {
  //         errors.email = "Email already exists";
  //       }
  //       res.status(400).json(errors);
  //     } else {
  //       const user = new User({
  //         email,
  //         username,
  //         password,
  //         fullname,
  //       });
        // bcrypt.hash(password, 10, (err, hash) => {
        //   if (err) throw err;
        //   user.password = hash;
        //   user
        //     .save()
        //     .then((user) => res.json(user))
        //     .catch((err) => console.log(err));
        // });
  //     }
  //   })
  //   .catch((err) => console.log(err));



module.exports = authController