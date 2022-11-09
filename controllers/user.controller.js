const User = require("../models/User");


const userController = {}


userController.getUsersList = async (req,res) => {
  const {id} = req.user;
  const users = await User.find({_id:{$ne:id}}).select('username fullname')
  res.send(users)
}

userController.getUser = async (req,res) => {
  try {
    const {username} = req.params;
    const user = await User.findOne({username}).exec();
    if (user){
      res.send(user)
    } else {
      res.sendStatus(404)
    }
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

module.exports = userController;