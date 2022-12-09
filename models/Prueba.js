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
  // retweet:{
  //     type: Schema.Types.ObjectId,
  //     ref:"Tweet",
  // },
  // parentId:{
  //     type: Schema.Types.ObjectId,
  //     ref:"Tweet",
  // },
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
  // comments:[
  //     {
  //         commentId:String,
  //     }
  // ]
},
{
  toObject : {getters: true, virtuals: true },
  toJSON : {getters: true, virtuals: true}
}
)

tweetSchema.plugin(mongooseLeanGetters)
tweetSchema.plugin(mongooseLeanVirtuals)
tweetSchema.virtual('comments',{
  ref:'Comment',
  localField:'_id',
  foreignField:'parentId'
})

const Tweets = mongoose.model('Twitter',tweetSchema)

const Comment = Tweets.discriminator('Comment',
new mongoose.Schema({
  parentId:{
    type: Schema.Types.ObjectId,
    ref:"Tweet",
}})
)

module.exports = {Comment,Tweets}