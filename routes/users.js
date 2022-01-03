const express = require("express");
const router = express.Router();
const passport = require("passport")
const {
  cloudinary,
  downloader,
  uploader,
} = require("../services/cloudinaryService");
const User = require("../models/Users");
const { addNotification } = require("./socket");
const mongoose = require("mongoose");


router.get("/prueba", async (req, res) => {
  const profile = downloader({ fileId: "users/${username}/profile" });
  const bg = downloader({ fileId: "users/${username}/bg" });
  const [profilePic, bgPic] = await Promise.all(
    [profile, bg].map((e) => e.catch((e) => e))
  );

  if (!profilePic) {
  }
  if (!bgPic) {
  }
});
router.put("/usersettings", async (req, res) => {
  const { username, fullname, bio, pic, bg } = req.body;
  try {
    const user = await User.findOneAndUpdate({ username }, { fullname, bio });
    let obj = {
      public_id: "profile",
      folder: `users/${username}`,
      overwrite: true,
    };
    let result = await uploader(pic, obj);
    obj.public_id = "bg";
    result = await uploader(bg, obj);
    res.status(200).json({ message: "User's data updated succesfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "An error ocurred while updating the user's data" });
  }
});

router.post("/getUser", async (req, res, next) => {
  const { username } = req.body;
  const user = await User.findOne({ username });
  if (user == null) {
    next();
  } else {
    const { _id, fullname, bio, followers, following } = user;
    const profile = downloader({ fileId: `users/${username}/profile` });
    const bg = downloader({ fileId: `users/${username}/bg` });
    const [profilePic, bgPic] = await Promise.all(
      [profile, bg].map((e) =>
        e.catch((error) => {
          console.log(error);
          return false;
        })
      )
    );
    res.status(200).json({
      file: profilePic.pic ? profilePic.pic : null,
      bg: bgPic.pic ? bgPic.pic : null,
      _id,
      username,
      fullname,
      bio,
      followers,
      following,
    });
  }
});

router.put("/follow", async (req, res) => {
  const { profile, follower } = req.body; // username:mick follower:frost
  const user = await User.findById(profile);
  if (
    user.followers.find((e) => e.equals(mongoose.Types.ObjectId(follower))) ==
    undefined
  ) {
    user.followers.push(follower);
    user.save().then(async () => {
      const otherUser = await User.findById(follower);
      otherUser.following.push(profile);
      await otherUser.save();
      const note = {
        username: otherUser.username,
        text: `${otherUser.username} is now following you!`,
        url: `/${otherUser.username}`,
      };
      addNotification(req.io, note, user.username);
      res.status(200).json({ status: true });
    });
  } else {
    user.followers = user.followers.filter(
      (e) => !e.equals(mongoose.Types.ObjectId(follower))
    );
    user.save().then(async () => {
      const otherUser = await User.findById(follower);
      otherUser.following = otherUser.following.filter(
        (e) => !e.equals(mongoose.Types.ObjectId(profile))
      );
      otherUser.save().then(() => res.status(200).json({ status: false }));
    });
  }
});

router.post("/upload", (req, res) => {
  const { id, username, image } = req.body;
  cloudinary.uploader.upload(
    image,
    { public_id: "profile", folder: `users/${username}`, overwrite: true },
    (error, result) => {
      if (error) {
        console.log(error);
      } else {
        User.findByIdAndUpdate(id, { profilePic: result.public_id }).then(
          () => {
            res.status(200).json({ message: "ALL GOOD!" });
          }
        );
      }
    }
  );
});

router.post("/notifications", async (req, res) => {
  const promise = (e) => {
    return new Promise((resolve) => {
      User.findOne({ username: e.username }).then((user) => {
        const userInfo = {
          username: user.username,
          fullname: user.fullname,
        };
        cloudinary.api.resource(
          `users/${e.username}/profile`,
          (error, result) => {
            if (result) {
              userInfo.image = result.secure_url;
            } else {
              userInfo.image = "";
            }
            resolve({
              ...userInfo,
              text: e.text,
              url: e.url,
            });
          }
        );
      });
    });
  };
  const { username } = req.body;

  const user = await User.findOne({ username });
  if (user) {
    const array = await Promise.all(
      user.notifications.notes.map((e) => promise(e))
    );
    return res.status(200).json(array);
  }
  res.status(200).json([]);
});

router.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const {_id} = req.user
    try {
      const users = await User.find({_id:{$ne:_id}},'_id username fullname').lean();

      const promises = await Promise.all(users.map(async (e) => {
        try {
          const resource = await cloudinary.api.resource(`users/${e.username}/profile`)
          return {...e,pic:resource.secure_url}
        } catch (error) {
          if (error.error.http_code === 404){
            console.log("ERROR")
            return {...e,pic:""}
          }else {
            return {...e,pic:""}
          }
        }
      }))
      
      return res.status(200).json(promises);
    } catch (error) {
      console.log(error);
      console.log("SECOND")
      return res
        .status(500)
        .json({ message: "An error ocurred while retrieving users list" });
    }
  }
);

module.exports = router;
