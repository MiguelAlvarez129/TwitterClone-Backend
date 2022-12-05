const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const getDate = require('../utils/getDate')
const mongooseLeanGetters = require('mongoose-lean-getters');

const commentSchema = new Schema({
  author:{
    type: Schema.Types.ObjectId,
    ref:"User",
    required:true,
  },
  tweetId:{
    type: Schema.Types.ObjectId,
    ref:"Tweet",
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
]},{
  toObject : {getters: true},
  toJSON : {getters: true}
})

commentSchema.plugin(mongooseLeanGetters)

module.exports = Comment = mongoose.model('Comment',commentSchema)