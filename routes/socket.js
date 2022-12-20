const Tweet = require("../models/Tweets-old");
const User = require("../models/User");
const cache = require("../services/cache")

exports.socketConfig = (io) =>{
  
  io.on("connection", socket => {   
    console.log("new connection",socket.id)
    const {id:socketId} = socket;
    socket.once("online",async (e)=>{
      console.log(e,socketId)
      const {userId} = e;
      cache.storage.push({userId,socketId}) 
      // const user = await User.findOne({username})
      // cache.storage
      // .filter(e => e.userId === userId)
      // .map(({username,id}) =>{
        
      //   io.to(id).emit("notification",user.notifications.pending)
      // })
      console.log("users",cache.storage)
    })

    socket.on("notificationsRead",async (e)=>{
      const {username} = e;
      // console.log(e)
      const array = cache.storage
      .filter(e => e.username === username)
      .map(async ({username,id}) =>{
        const user = await User.findOne({username})
        user.notifications.pending = 0
        await user.save() 
        io.to(id).emit("notification",user.notifications.pending)
      })
      console.log(array, "ARRAY")
      
    })

    socket.on("disconnect",()=>{
      console.log(cache.storage.filter((e) => e.id !== socket.id))
      cache.storage = cache.storage.filter((e) => e.id !== socket.id)
      console.log("users",cache.storage) 
    })
  })
}

exports.getNotification = (io) =>{
  io.on("connection",socket =>{
    console.log(socket.id,"notificationEvent")
  })
}

exports.addNotification = async (io,note,username) =>{
    console.log(username)
    const user = await User.findOne({username})
    console.log(user)
    user.notifications.pending++
    user.notifications.notes.unshift(note)
    //user.markModified('notifications'); 
    await user.save()
    cache.storage
    .filter(e => e.username === username)
    .map(({username,id}) =>{
      io.to(id).emit("notification",user.notifications.pending)
    })
}

