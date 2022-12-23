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
      const {username:authorUsername} = await User.findOne({_id:_doc.author}).exec()
      let content = getContent(_doc[type],username);
      console.log(`${authorUsername}/${_doc._id}`)
      const notification = new TweetNotifications({
        for:mongoose.Types.ObjectId(_doc.author),
        from: mongoose.Types.ObjectId(_doc[from]),
        tweetId:_doc._id,
        content,
        path: `${authorUsername}/${_doc._id}`,
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
    case type === 'comment':
      return `@${username} commented your tweet`
    default:
      return ''
  }
}