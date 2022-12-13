const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const getDate = require('../utils/getDate')
const mongooseLeanGetters = require('mongoose-lean-getters');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

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
  likes:[
      {
          type:String,
      }
  ],
  files:[
      {
          type:String,
      }
  ],
},
{
  toObject : {getters: true, virtuals: true },
  toJSON : {getters: true, virtuals: true}, 
})

tweetSchema.plugin(mongooseLeanGetters)
tweetSchema.plugin(mongooseLeanVirtuals)
tweetSchema.virtual('comments',{
  ref:'Twitter',
  localField:'_id',
  foreignField:'parentId'
})

tweetSchema.virtual('retweet',{
  ref:'Twitter',
  localField:'retweetId',
  foreignField:'_id',
  justOne: true,
})

tweetSchema.virtual('retweets',{
  ref:'Twitter',
  localField:'_id',
  foreignField:'retweetId',
})


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
  retweetId:{
    type: Schema.Types.ObjectId,
    ref:"Twitter",
  },
  quotedRetweet:{
    type: Schema.Types.Boolean,
    default: false,
  }
})
)

module.exports = {Comment,Tweets,Retweet}