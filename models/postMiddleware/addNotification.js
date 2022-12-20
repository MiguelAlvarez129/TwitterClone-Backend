const User = require('../../models/User');
const {TweetNotifications} = require('../../models/Notifications');
const {Tweets,Retweet} = require('../../models/Tweets')
const mongoose = require('mongoose');


module.exports = async (_doc) =>{
  const props = Object.getOwnPropertySymbols(_doc)
  if (props){
    const [type,from] = props
    if (!_doc[type]){
      await TweetNotifications.deleteOne({tweetId:_doc._id,from:_doc[from]});
    } else {
      const {username} = await User.findOne({_id:_doc[from]}).select('username').exec()
      let content = getContent(_doc[type],username);
      
      const notification = new TweetNotifications({
        for:mongoose.Types.ObjectId(_doc.author),
        from: mongoose.Types.ObjectId(_doc[from]),
        tweetId:_doc._id,
        content,
      })

      await notification.save()
    }
  }
}

const getContent = (type,username) =>{
  switch(true){
    case type === 'like':
      return `@${username} liked your tweet`
    case type === 'retweet':
      return `@${username} retweeted your tweet`
    default:
      return ''
  }
}