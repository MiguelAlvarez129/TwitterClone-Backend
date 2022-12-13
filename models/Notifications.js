const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const notificationSchema = new Schema({
  author:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true,
  },
  content:{
    Type: Schema.Types.String,
    default:'',
  },
  // url:{
  //   Type: Schema.Types.String,
  //   default:'',
  // },
})

module.exports = mongoose.Model('Notifications',notificationSchema)