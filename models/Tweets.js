const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    comment: {
        type: Schema.Types.ObjectId,
        ref:"Tweet",
    }
    ,
    date:{
        type: Date,
        default: Date.now
      },
    content:{
        type:String,
        default:"",
    },
    likes:{
        quantity:{
            type:Number,
            default:0,
        },
        usersLiked:[
            String
        ],
    },
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
})



module.exports = Tweet = mongoose.model('Tweet',tweetSchema)