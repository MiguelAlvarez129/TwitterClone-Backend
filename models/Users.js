const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullname:{
        type:String,
        required:true
    },
    username: {
        type:String,
        required:true
    },
    
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    date:{
        type: Date,
        default: Date.now
      },
    bio:{
        type:String,
        default:"",
    },
    following: [
        Schema.Types.ObjectId,
    ],
    followers:[
        Schema.Types.ObjectId,
    ],
    notifications:{
        pending:{
            type:Number,
            default:0,
            
        },
        notes:{
            type:Array,
            
        }

        
    }

})

module.exports = User = mongoose.model('User',userSchema)