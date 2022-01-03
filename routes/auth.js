const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const config = require("../config/keys");
const passport = require("passport");
const User = require("../models/Users");
const secret = require("../config/keys").secretOrKey;
const {cloudinary} = require("../services/cloudinaryService");



  router.post(
    "/auth",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      const { _id, username,fullname} = req.user;
      User.findById(_id).then((user) => {
        if (user) {
          cloudinary.api.resource(`users/${username}/profile`,(error,result)=>{
            if (error){
              console.log(error)
              res.status(200).json({
                file:null,
                _id,
                username,
                fullname
              })
            } else {
              res.status(200).json({
                file:result.secure_url,
                _id,
                username,
                fullname
              })
            }
          })
        } else {
          console.log("error");
          res.status(404).json({ error: "User not found" });
        }
      });
    }
  );

  router.post("/login", (req, res) => {
    const { username, password } = req.body;
    User.findOne({ username }).then((user) => {
      if (!user) {
        res.status(404).json({ error: "Username doesn't exist" });
      } else {
        bcrypt.compare(password, user.password).then((match) => {
          if (match) {
            const payload = {
              username: user.username,
              id: user.id,
              fullname:user.fullname,
            };
            jwt.sign(payload, secret, (err, token) => {
              res.status(200).json({
                token: "Bearer " + token,
                message: "Succesfully logged in",
              });
            });
          } else {
            res.status(400).json({ message: "Password Incorrect" });
          }
        });
      }
    });
  });

  router.post("/register", (req, res) => {
    const { username, email, password, fullname } = req.body;
    User.findOne({ $or: [{ username }, { email }] })
      .then((user) => {
        if (user) {
          console.log(user);
          let errors = {};
          if (user.username == username) {
            errors.username = "Username already exists";
          }
          if (user.email == email) {
            errors.email = "Email already exists";
          }
          res.status(400).json(errors);
        } else {
          const user = new User({
            email,
            username,
            password,
            fullname,
          });
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) throw err;
            user.password = hash;
            user
              .save()
              .then((user) => res.json(user))
              .catch((err) => console.log(err));
          });
        }
      })
      .catch((err) => console.log(err));
  });

module.exports = router


