const dayjs = require("dayjs")
const mongoose = require("mongoose")
const Tweets = require("../models/Tweets")
const User = require("../models/User")
const Comments = require("../models/Comments")

const tweetController = {}

tweetController.getFeed = async (req,res) =>{
  try {
    const tweets = await Tweets.find({parentId: null},null,{ sort: { date: "desc" }})
    .populate({path:"author",select:"username fullname profilePic -_id"})
    .lean({getters: true})
    .exec()

    const feed = await Promise.all(tweets.map(async e => {
      console.log(e._id)
      const comments = await Tweets.find({parentId:mongoose.Types.ObjectId(e._id)})
      .exec()
      return {...e,comments}
    }))

    res.json(feed)

  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
} 

tweetController.createTweet = async (req,res) =>{
  try {
    const {content,reply} = req.body,
    {id} = req.user;
    const files = req.files.map((e) => e.path);
    const tweet = new Tweets({
      author: mongoose.Types.ObjectId(id),
      content,
      files,
      parentId: reply && mongoose.Types.ObjectId(reply)
    });

    tweet.save();
    res.send();
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

tweetController.getTweet = async (req,res) =>{
  try {
    const {_id} = req.params;
    const tweet = await Tweets.findOne({_id})
    .populate({path:"author",select:"username fullname profilePic -_id"})
    .lean()
    .exec()
    if (tweet){
      const date = dayjs(tweet.date).format('h:mm A · D MMM YYYY')
      res.send({...tweet,date})
    } else {
      return res.sendStatus(404);
    }
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

tweetController.likeTweet = async (req,res) =>{
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

tweetController.getComments = async (req,res) => {
  try {
    const {_id} = req.params;
    const comments = await Tweets.find({parentId : mongoose.Types.ObjectId(_id)})
    
    // const {comments} = await Tweets.findOne({_id},null,{ sort: { date: "desc" }})
    .populate({
   
      path:"author",
      select:"username -_id fullname profilePic"
    })
    .lean({getters: true})
    .exec()
    // res.send(comments.map(({_id}) => ({..._id})))
    console.log(comments)
    res.send(comments)
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

tweetController.getUserTweets = async (req,res) => {
  try {
    const {username} = req.params;
    const user = await User.findOne({username}).exec();
    const tweets = await Tweets.find({author:user._id},null,{ sort: { date: "desc" }}).populate('author').exec()
    res.send(tweets)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}
module.exports = tweetController


tweetController.addComment = async (req,res) =>{
  try {
    const {content,reply} = req.body,
    {id} = req.user;
    const files = req.files.map((e) => e.path);
    const comment = new Comments({
      author: mongoose.Types.ObjectId(id),
      tweetId: mongoose.Types.ObjectId(reply),
      content,
      files,
    })

    await comment.save();
    res.send();
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}