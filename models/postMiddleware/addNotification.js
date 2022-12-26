const User = require('../../models/User');
const {TweetNotifications} = require('../../models/Notifications');
// const {Tweets,Retweet} = require('../../models/Tweets')
const mongoose = require('mongoose');


module.exports = async (_doc) =>{
  console.log(_doc)
  const props = Object.getOwnPropertySymbols(_doc)
  // if (props){
  //     const [from] = props
  //     const {username} = await User.findOne({_id:_doc[from]}).select('username').exec()
  //     const {username:authorUsername} = await User.findOne({_id:_doc.author}).exec()
  //     let content = getContent(_doc.constructor.modelName,username);
  //     console.log(`${authorUsername}/${_doc._id}`)
  //     const notification = new TweetNotifications({
  //       for:mongoose.Types.ObjectId(_doc.author),
  //       from: mongoose.Types.ObjectId(_doc[from]),
  //       tweetId:_doc._id,
  //       content,
  //       path: `${authorUsername}/${_doc._id}`,
  //     })
  //     await notification.save()
  // }
}

const getContent = (type,username) =>{
  switch(true){
    case type === 'Like':
      return `@${username} liked your tweet`
    case type === 'Retweet':
      return `@${username} retweeted your tweet`
    case type === 'Comment':
      return `@${username} commented your tweet`
    default:
      return ''
  }
}