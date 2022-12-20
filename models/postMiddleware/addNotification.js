const User = require('../../models/User');
const Notifications = require('../../models/Notifications');
const {Tweets,Retweet} = require('../../models/Tweets')
const mongoose = require('mongoose');


module.exports = async (_doc) =>{
  const props = Object.getOwnPropertySymbols(_doc)
  if (props){
    // if (_doc instanceof Tweets){
    //   console.log('TWEET!')
    // } else {
    //   console.log('NOT TWEET')
    // }
    console.log(_doc.model)
    // const [type,from] = props
    // const {username} = await User.findOne({_id:_doc[from]}).select('username').exec()
    // let content;
    // if (_doc[type] === 'remove'){

    // } else if (_doc[type] === 'like'){
    //   content = `@${username} liked your tweet`
    // } 

    // const notification = new Notifications({
    //   for:mongoose.Types.ObjectId(_doc.author),
    //   from: mongoose.Types.ObjectId(_doc[from]),
    //   content,
    // })

    // await notification.save()

  }
}