const User = require('../../models/User');
const {TweetNotifications} = require('../../models/Notifications');
// const {Tweets,Retweet} = require('../../models/Tweets')
const mongoose = require('mongoose');


module.exports = async (_doc) =>{
  const props = Object.getOwnPropertySymbols(_doc)
  if (props){
    const [from] = props
    await TweetNotifications.deleteOne({tweetId:_doc._id,from:_doc[from]});
  }
}
