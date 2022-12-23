const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const notificationSchema = new Schema({
  for:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true,
  },
  from:{ 
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true,
  },
  content:{
    type:String,
    default:"",
  },
  path:{
    type: String,
    default:"",
  },
})



const Notifications =  mongoose.model('Notifications',notificationSchema)

const TweetNotifications = Notifications.discriminator('TweetNotifications',
new mongoose.Schema({
  tweetId:{
    type: Schema.Types.ObjectId,
    ref:"Twitter",
}})
)

module.exports = {Notifications,TweetNotifications}
