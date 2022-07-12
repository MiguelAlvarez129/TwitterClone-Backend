const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const config = require("../config/keys");
const Tweet = require("../models/Tweets");
const User = require("../models/Users");
const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
const { getFile } = require("../services/gridFsServices");
const {cloudinary,downloader,uploader} = require("../services/cloudinaryService");
const passport = require("passport")
const cache = require("../services/cache")
const {addNotification} = require("./socket")

dayjs.extend(relativeTime)

  const getComments = (commentId) =>{
    return new Promise(async (resolve)=>{
      try {
        const tweet = await Tweet.findById(commentId)
        .select("_id content likes files retweets date")
        .populate({path:"author",select:"username fullname -_id"})
        .exec() 
        const userInfo = {...tweet.author._doc}
      
        cloudinary.api.resource(`users/${tweet.author.username}/profile`,(error,result)=>{
          if (result){
            userInfo.image = result.secure_url;
          } else {
            userInfo.image = ""
          }
          const date = getDate(tweet.date)
         
          resolve({...tweet._doc,date,...userInfo,comment:true})
        })
      } catch (error) {
        console.log(error)
        res.status(500).json({message:"An error ocurred while retrieving the comments"})
      }
    })
  }

  const getDate = (tweetDate) => {
  const date1 = dayjs(tweetDate)
  const dif = dayjs().diff(date1,'hour')
  const difMinutes = dayjs().diff(date1,'minute')

  //const timeSince = dayjs().to(dayjs(post.date))
  const longdate = date1.format('MMM D, YYYY')
  const shortdate = date1.format('MMM D')
  return difMinutes == 0 ? 
  "a few moments ago" : difMinutes <= 60 ? 
  difMinutes + "m" : 
  dif <= 24 ? 
  dif + "h" :
  date1.year() == dayjs().year() ? shortdate : longdate;
  
 }

 const checkTweet = (tweet) =>{
   return new Promise((resolve)=>{
    if (tweet.retweet){
      Tweet.findById(tweet.retweet)
      .then((tweet)=>{
        cloudinary.api.resource(`users/${username}/profile`,(error,result)=>{
          if (result) {
            userInfo.image = result.secure_url;
          } else {
            userInfo.image = null;
          }
        })
      })
    }
   })
 }

  router.post("/feed", async (req,res)=>{
    const { userId } = req.body;
    if (userId){
      const { following } = await User.findById(userId)
      const followingTweets = await Tweet.find({author:{$in:following}}, null, { sort: { date: "desc" } })
      .select("_id content comments likes files retweets content date")
      .populate([
        {
          path:"retweet",
          select:"_id content comments likes files retweets content date",
          populate:{
            path:"author",
            select:"username -_id fullname"
          }
        },
        {
          path:"author",
          select:"-_id username fullname",
         }
      ])
      .exec()

      const tweets = await Tweet.find({comment: null, author:{$nin:following}}, null, { sort: { date: "desc" } })
      .select("_id content comments likes files retweets content date")
      .populate([
        {
          path:"retweet",
          select:"_id content comments likes files retweets content date",
          populate:{
            path:"author",
            select:"-_id username fullname"
          }
        },
        {
          path:"author",
          select:"-_id username fullname",
         }
      ])
      .exec()

      const feed = await Promise.all([...tweets,...followingTweets].sort((a,b) => b.date - a.date)
      .map(async(e)=>{
        const date = getDate(e.date)
        if (e.retweet){
          const {retweet,retweet:{author}} = e;
          const retweetBy = e.author.fullname;
          try {
            const result = await downloader({fileId:`users/${author.username}/profile`})
            const userInfo = {image:result ? result.pic : null,...author._doc}
            return { retweet:true,retweetBy,...userInfo,...retweet._doc,date}
          } catch (error) {
            if (error.http_code === 420){
              return { retweet:true,retweetBy,...userInfo,...retweet._doc,date}
            } else {

            }
            
          }
        } else {
          const {author} = e
          const result  = await downloader({fileId:`users/${author.username}/profile`})
          const userInfo = {image:result ? result.pic : null,...author._doc}
          
          return {...e._doc,...userInfo,date}
        }
      }))
      
      return res.status(200).json(feed)
    } else {
      const feed = await Tweet.find({}, null, { sort: { date: "desc" } })
      .select("_id content comments likes files retweets content date")
      res.status(200).json({feed})
    }
  })
  router.get("/hey", async (req,res)=>{
    try {
      const image = await downloader({fileId:"/something/something"})
      console.log(image)
    } catch (error) {
      if (error.http_code === 404){
        res.status(400).end()

      }
    }
    
  })
  router.post("/getUserTweets", async (req,res)=>{
    const { userId } = req.body;
    let userInfo = {};
    const user = await User.findById(userId);
    let { username, fullname} = user;
    const {pic} = await downloader({fileId:`users/${username}/profile`})
    userInfo = { username, image:pic, fullname };
    const retweetBy = fullname;
    try{
      const tweets = await Tweet.find({ author: userId, comment: null}, null, { sort: { date: "desc" } })
      .select("_id retweet content comment comments likes files retweets date")
      .populate({
      path:"retweet",
      select:"_id content comments likes files retweets content date",
      populate:{
        path:"author",
        select:"fullname username -_id"
      }
      })
      .exec() 
      console.log(tweets)
      const result = tweets.map(async (e)=>{
        const date = getDate(e.date)
        if (e.retweet){
          const {retweet,retweet:{author}} = e;
          console.log("author",author)
          try {
            const {pic} = await downloader({fileId:`users/${author.username}/profile`})
            userInfo = {image:pic,...author._doc}
            return { retweet:true,retweetBy,...userInfo,...retweet._doc,date}
          } catch (error) {
            console.log(error)
          }
        } else {
          return {...e._doc,...userInfo,date}
        }
      })
      Promise.all(result)
      .then(result => res.status(200).json(result))
    } catch (error) {
      console.log(error)
      res.status(500).json({message:"An error ocurred while retrieving the tweets"})
    }
  })

  router.post("/getComments",(req,res)=>{
    const {comments} = req.body;
    Promise.all(comments.map(async({commentId})=>{
      return getComments(commentId)
    })).then((comments)=>{
      res.status(200).json(comments)
    })
   
  })

  router.post("/testposts", (req,res)=>{
    const {files} = req.body;
    Promise.all(files.map(file=> downloader(file)))
    .then((result)=>{
      res.status(200).json(result)
    })
  })

  router.post("/likePost",passport.authenticate("jwt", { session: false }), async (req,res)=>{
    const {_id} = req.body;
    const tweet = await Tweet.findById(_id)
    if (!tweet.likes.usersLiked.includes(req.user._id)){
      tweet.likes.quantity++;
      tweet.likes.usersLiked.push(req.user._id)
      tweet
      .save()
      .then(tweet => res.status(200).json({tweet}))
    } else {
      tweet.likes.quantity--;
      const index = tweet.likes.usersLiked.indexOf(req.user._id)
      tweet.likes.usersLiked.splice(index,1)
      tweet
      .save()
      .then(tweet => res.status(200).json({tweet}))
    }
  })

  router.post("/createPost", async (req, res) => {
    const {_id,username,files,text,tweetId} = req.body;
    console.log(tweetId)
    Promise.all(files.map(e => uploader(e,{folder: `users/${username}/postImages`}))).then(async (files)=>{
      const tweet = new Tweet({
        author:mongoose.Types.ObjectId(_id),
        content:text,
        files,
        comment: tweetId ? mongoose.Types.ObjectId(tweetId) : null
      })
      
      await tweet.save()
      let {author,comment} = await Tweet
      .populate(tweet,[{path:"comment"},{path:"author"}])
      let note =  {
        username:author.username,
        text:`new tweet notification from ${author.username}`,
        url:`/${author.username}/${tweet._id}`
      } 
    
     author.followers.map(async (e)=>{
        const {username} = await User.findById(mongoose.Types.ObjectId(e))
        addNotification(req.io,note,username)
      })
      if (!!comment){
        comment.comments.push({commentId:tweet._id})
        await comment.save()
        let parentTweet = await Tweet.populate(comment,{path:"author"})
        note = {
        username:author.username,
        text:`${author.username} added a new comment in your tweet!`,
        url:`/${author.username}/${comment._id}`
      }
      addNotification(req.io,note,parentTweet.author.username)
      }
      res.status(200).json({message:"New tweet added!"})
    }).catch((error)=>{
      console.log(error)
      res.status(500).json({message:"An error ocurred while tweeting"})
    })
  });

  router.get("/hey", async (req,res)=>{
    console.log(cache.storage[0].id)
    req.io.to(cache.storage[0].id).emit("notification",1)
    res.status(200).json({})
   })
  
  router.post("/retweet", passport.authenticate("jwt", { session: false }),async (req,res)=>{
    const {_id} = req.body;
    const tweet = await Tweet.findOneAndDelete({author:req.user._id,retweet:_id})
    if (tweet){
      Tweet.findById(_id)
      .then(retweet=>{
        retweet.retweets.quantity--;
        const array = retweet.retweets.usersRetweeted;
        const index = array.indexOf(_id)
        retweet.retweets.usersRetweeted.splice(index,1);
        retweet.save().then(() => res.status(200).json({retweet,message:"Retweet deleted"}) )
      })
    } else {
      const tweet = new Tweet({
      author: req.user._id,
      files: [],
      retweet:mongoose.Types.ObjectId(_id), 
      })
      await tweet.save()
      let {retweet,author} = await tweet.populate("author retweet").execPopulate()
      retweet.retweets.quantity++
      retweet.retweets.usersRetweeted.push(req.user._id)
      await retweet.save()
      const originalAuthor = await retweet.populate({path:"author",select:"username"}).execPopulate()
      const note = {
        username:author.username,
        text:`${author.username} retweeted your tweet`,
        url:`/${author.username}/${req.user._id}`
      }
      addNotification(req.io,note,originalAuthor.author.username)
      res.status(200).json({retweet,message:"Retweet added!"})
    }
  })

  router.post("/getSinglePost", async (req,res,next) =>{
    const {tweetId} = req.body;
    try {
      const tweet = await Tweet.findById(mongoose.Types.ObjectId(tweetId))
      .select("content comments likes files retweets date _id author")
      .populate({
        path:"author",
        select:"fullname username -_id"
      })
      .exec()
      if (tweet == null) return next()
      const {pic} = await downloader({fileId:`users/${tweet.author.username}/profile`})
      const userInfo = {...tweet.author._doc,image:pic}
      const date = dayjs(tweet.date).format('h:mm A · D MMM YYYY')
      const {author,...contents} = tweet._doc;
      res.status(200).json({...contents,...userInfo,date})
    } catch (e) {
      console.log("HERE!!")
      console.log(e)
      next()
    }
  })
 

  router.post("/",(req,res)=>{
    const {tweetId} = req.body;
  })
  
module.exports = router

  
