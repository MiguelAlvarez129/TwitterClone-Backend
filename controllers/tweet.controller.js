const mongoose = require("mongoose")
const Tweets = require("../models/Tweets")
const User = require("../models/User")

const tweetController = {}

tweetController.getFeed = (req,res) =>{
  res.send([])
}

tweetController.createTweet = async (req,res) =>{
  try {
    const {content} = req.body,
    {id} = req.user;
    const files = req.files.map((e) => e.path);
    const tweet = new Tweets({
      author: mongoose.Types.ObjectId(id),
      content,
      files,
    });
    tweet.save();
    res.send()
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}



module.exports = tweetController

