const User = require("../models/User");


const userController = {}


userController.getUsersList = async (req,res) => {
  const {id} = req.user;
  const users = await User.find({_id:{$ne:id}}).select('username fullname')
  res.send(users)
}


module.exports = userController;