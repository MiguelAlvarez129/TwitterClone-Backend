const path = require("path");
const User = require("../models/User");
const fs = require('fs').promises
const constants = require('fs').constants
const userController = {}

const checkFileExists = async (path, property) => {
  const check = await fs.access(path,constants.F_OK)
  .then(() => true)
  .catch(() => false)

  if (check) await fs.unlink(path)
}

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
    if (user){
      if (req.files['profile']) {
        checkFileExists(user.profilePic)
        user.profilePic = req.files['profile'][0].path;
      }
      if (req.files['bg']) {
        checkFileExists(user.bgPic)
        user.bgPic = req.files['bg'][0].path;
      }
      // if (req.files['bg']) user.bgPic = req.files['bg'][0].path;
      user.bio = req.body.bio;
      user.fullname = req.body.fullname
      await user.save()
      const json = {
        profilePic:req.files['profile'] && req.files['profile'][0].path,
        fullname: req.body.fullname
      }
      console.log(json)
      res.send(json)
    } else {
      res.sendStatus(404)
    }
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

module.exports = userController;