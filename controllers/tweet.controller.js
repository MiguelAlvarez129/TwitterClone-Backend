const dayjs = require("dayjs")
const mongoose = require("mongoose")
// const Tweets = require("../models/Tweets")
const User = require("../models/User")
// const Comments = require("../models/Comments")
const {Tweets,Comment,Retweet} = require("../models/Tweets")
const Likes = require("../models/Likes")
const tweetController = {}

const tweet = Symbol('tweet')
const from = Symbol('from')


tweetController.getFeed = async (req,res) =>{
  try {
    const tweets = await Tweets.find({$or:[{__t:[null,'Retweet']}]},null,{ sort: { date: "desc" }})
    .populate({path:"author",select:"username fullname profilePic -_id"})
    .populate('comments')
    .populate({
      path:'retweet',
      populate:[
        {path:"author",select:"username fullname profilePic -_id"},
        {path:'retweet', populate:[{path:"author"}]},
        {path:'likes'},
        {path:"comments"}
      ]
    })
    .populate('retweets')
    .populate("likes")
    .lean({getters: true, virtuals: true}) 
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
    await tweet.save();
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
    .populate({path:"like",select:"userLiked"})
    .populate('comments')
    .populate({
      path:'retweet',
      populate:[
        {path:"author",select:"username fullname profilePic -_id"},
        {path:'retweet', populate:{path:"author"}}
      ]
    })
    .populate({
      path:'retweets',
      select:"author"
    })
    .lean({virtuals: true}) 
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
    const like = new Likes({
      userLiked: mongoose.Types.ObjectId(userId),
      tweetId: mongoose.Types.ObjectId(_id)
    })

    like[from] = userId
    like[tweet] = _id
    
    await like.save()


    const likes = await Likes.find({tweetId:mongoose.Types.ObjectId(_id)})
    .lean({getters: true, virtuals: true})
    .exec()
    res.send(likes.map((e) => e.userLiked))
    
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

tweetController.getComments = async (req,res) => {
  try {
    const {_id} = req.params;

    const tweets = await Comment.find({parentId : mongoose.Types.ObjectId(_id)})
    .populate({
      path:"author",
      select:"username -_id fullname profilePic"
    })
    .populate('comments')
    .populate({
      path:'retweet',
      populate:[
        {path:"author",select:"username fullname profilePic -_id"},
        {path:'retweet', populate:{path:"author"}}
      ]
    })
    .populate({
      path:'retweets',
      select:"author"
    })
    .lean({getters: true, virtuals:true})
    .exec()
    res.send(tweets)
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

tweetController.getUserTweets = async (req,res) => {
  try {
    const {username} = req.params;
    const user = await User.findOne({username}).exec();
    const tweets = await Tweets.find({author:user._id},null,{ sort: { date: "desc" }})
    .populate({
      path:"author",
      select:"username -_id fullname profilePic"
    })
    .populate('comments')
    .populate({
      path:'retweet',
      populate:[
        {path:"author",select:"username fullname profilePic -_id"},
        {path:'retweet', populate:{path:"author"}}
      ]
    })
    .populate({
      path:'retweets',
      select:"author"
    })
    .lean({getters: true, virtuals:true})
    .exec()
    
    res.send(tweets)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}


tweetController.addComment = async (req,res) =>{
  try {
    const {content,reply} = req.body,
    {id} = req.user;
    const files = req.files.map((e) => e.path);
    const comment = new Comment({
      author: mongoose.Types.ObjectId(id),
      parentId: mongoose.Types.ObjectId(reply),
      content,
      files,
    })
    comment[from] = id
    // comment[tweet] = reply
    await comment.save();
    res.send();
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

tweetController.addRetweet = async (req,res) =>{
  try {
    const userId = req.user.id;
    const {content,_id} = req.body;
    const files = req.files?.map((e) => e.path);
    const tweet = new Retweet({
      author: mongoose.Types.ObjectId(userId),
      retweet:mongoose.Types.ObjectId(_id),
      quotedRetweet: !!content,
      content,
      files,
    })
    // tweet[type] = 'retweet'
    tweet[from] = userId
    await tweet.save()
    res.send()
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}


tweetController.removeRetweet = async (req,res) => {
  try {
    const userId = req.user.id;
    const {_id} = req.body;
    const found = await Tweets.findOne({retweetId:mongoose.Types.ObjectId(_id),author:userId})
    if (found){
      found[from] = userId
      // await Tweets.deleteOne({_id:found._id})
      await found.remove()
      return res.sendStatus(200)
    } else {
      return res.sendStatus(404)
    }
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

tweetController.removeLike = async (req,res) => {
  try {
    const userId = req.user.id;
    const {_id} = req.body;
    const found = await Likes.findOne({tweetId:mongoose.Types.ObjectId(_id),userLiked:userId})
    if (found){
      found[from] = userId
      // await Tweets.deleteOne({_id:found._id})
      await found.remove()
      const likes = await Likes.find({tweetId:mongoose.Types.ObjectId(_id)}).lean({ getters: true})
      .exec()
      

      return res.send(likes.map((e) => e.userLiked))
    } else {
      return res.sendStatus(404)
    }
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

module.exports = tweetController