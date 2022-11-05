const dayjs = require("dayjs")
const mongoose = require("mongoose")
const Tweets = require("../models/Tweets")
const User = require("../models/User")

const tweetController = {}

tweetController.getFeed = async (req,res) =>{
  try {
    const tweets = await Tweets.find(null,null,{ sort: { date: "desc" }})
    .populate({path:"author",select:"username fullname -_id"})
    .lean({getters: true})
    .exec()
    res.json(tweets)

  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
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

tweetController.getTweet = async (req,res) =>{
  try {
    const {_id} = req.params;
    console.log(_id, 'ID')
    const tweet = await Tweets.findOne({_id})
    .populate({path:"author",select:"username fullname -_id"})
    .lean()
    .exec()
    const date = dayjs(tweet.date).format('h:mm A · D MMM YYYY')
    res.send({...tweet,date})
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

tweetController.like = async (req,res) =>{
  try {
    const userId = req.user.id;
    const {_id} = req.body;
    const tweet = await Tweets.findOne({_id})
    if (tweet){
      if (tweet.likes.includes(userId)){
        tweet.likes = tweet.likes.filter((id) => id !== userId)
      } else {
        tweet.likes.push(userId)
      }
      await tweet.save()
      res.send(tweet.likes)
    } else {
      res.status(404).send();
    }
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

module.exports = tweetController
