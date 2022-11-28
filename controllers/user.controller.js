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

userController.updateProfile = async (req,res) => {
  try {
    const {id} = req.user;
    const user = await User.findOne({_id:id}).exec()
    console.log(req.files)
    if (user){
      if (req.files['profile']) user.bgPic = req.files['profile'][0].path;
      if (req.files['bg']) user.bgPic = req.files['bg'][0].path;
      user.bio = req.body.bio;
      user.fullname = req.body.fullname
      await user.save()
      res.sendStatus(200)
    } else {
      res.sendStatus(404)
    }
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

module.exports = userController;