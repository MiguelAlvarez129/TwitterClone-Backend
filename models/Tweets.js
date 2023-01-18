const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const getDate = require('../utils/getDate')
const mongooseLeanGetters = require('mongoose-lean-getters');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const addNotification = require('../models/postMiddleware/addNotification')
const {TweetNotifications} = require('../models/Notifications');
const removeNotification = require("./postMiddleware/removeNotification");
const tweetSchema = new Schema({
  author: {
      type: Schema.Types.ObjectId,
      ref:"User",
      required:true,
  },
  date:{
      type: Date,
      default: Date.now,
      get: getDate,
    },
  content:{
      type:String,
      default:"",
  },
  files:[
      {
          type:String,
      }
  ],
  likes:[
    {
      type:String
    }
  ],
  comments:[
    {
      type:String
    }
  ]
},
{
  toObject : {getters: true, virtuals: true },
  toJSON : {getters: true, virtuals: true}, 
})

tweetSchema.plugin(mongooseLeanGetters)
tweetSchema.plugin(mongooseLeanVirtuals)
// tweetSchema.virtual('comments',{
//   ref:'Twitter',
//   localField:'_id',
//   foreignField:'parentId',
//   count:true,
// })


tweetSchema.virtual('retweet',{
  ref:'Twitter',
  localField:'retweet',
  foreignField:'_id',
  justOne: true,
})

tweetSchema.virtual('retweets',{
  ref:'Twitter',
  localField:'_id',
  foreignField:'retweet',
})

// tweetSchema.virtual('likes',{
//   ref:'Like',
//   localField:'_id',
//   foreignField:'tweetId',
//   get:(likes) => likes ? likes.map(e => e.userLiked ? e.userLiked : e) : likes
// })
tweetSchema.post('save', async (_doc) =>  console.log(_doc.constructor.modelName))
tweetSchema.post('remove', async (_doc) => removeNotification(_doc))
const Tweets = mongoose.model('Twitter',tweetSchema)

const Comment = Tweets.discriminator('Comment',
new mongoose.Schema({
  parentId:{
    type: Schema.Types.ObjectId,
    ref:"Twitter",
}})
)

const Retweet = Tweets.discriminator('Retweet',
new mongoose.Schema({
  retweet:{
    type: Schema.Types.ObjectId,
    ref:"Twitter",
  },
  quotedRetweet:{
    type: Schema.Types.Boolean,
    default: false,
  }
})
)
// process.on('warning', e => console.warn(e.stack))
module.exports = {Comment,Tweets,Retweet}