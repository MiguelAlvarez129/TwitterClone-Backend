const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const getDate = require('../utils/getDate')
const mongooseLeanGetters = require('mongoose-lean-getters');

const tweetSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    retweet:{
        type: Schema.Types.ObjectId,
        ref:"Tweet",
    },
    comments: [
        {
        type: Schema.Types.ObjectId,
        ref:"Tweet",
        }
    ]
    ,
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
    retweets:{
        quantity:{
            type:Number,
            default:0,
        },
        usersRetweeted:[
            String
        ],
    },
    comments:[
        {
            commentId:String,
        }
    ]
},{
    toObject : {getters: true},
    toJSON : {getters: true}
})

tweetSchema.plugin(mongooseLeanGetters)


module.exports = Tweet = mongoose.model('Tweet',tweetSchema)