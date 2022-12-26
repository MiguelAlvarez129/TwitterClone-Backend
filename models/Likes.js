const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseLeanGetters = require('mongoose-lean-getters');
const addNotification = require("./postMiddleware/addNotification");

const likeSchema = new Schema({
  tweetId:{
    type:Schema.Types.ObjectId,
    ref:"Tweet",
    required:true,
  },
  userLiked:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true,
  }
},{
  toObject: {getters:true},
  toJSON: {getters:true}
})

// likeSchema.post('save', async (_doc) => addNotification(_doc))
// likeSchema.post('remove', async (_doc) => removeNotification(_doc))
likeSchema.plugin(mongooseLeanGetters)


module.exports = Likes = mongoose.model('Like',likeSchema)

