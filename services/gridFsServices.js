const express = require("express");
const mongoose = require("mongoose");
const config = require("../config/keys");

const connect = mongoose.createConnection(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;

connect.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(connect.db, {
    bucketName: "files",
  });
});

const deleteFile = id => { 
  return new Promise((resolve,reject)=>{
    gfs.delete(
      new mongoose.Types.ObjectId(id),
      (err,data)=>{
        if (err) reject(err)
        else resolve(data)
      }
    )
  })
}

const getFile = id => {
  return new Promise((resolve, reject) => {
    if (!id){
      resolve(null)
    }
    let readableStream = gfs.openDownloadStream(
      new mongoose.Types.ObjectId(id)
    );

    let file = "";
    let type = "";
   

    readableStream.on("data", (chunk) => {
      file += chunk.toString("base64");
    });

    readableStream.on("file", (file) => {
      type = file.contentType;
    });

    readableStream.on("error", (error) => {
      console.log(error);
      reject(error);
    });

    readableStream.on("end", () => {
      file = "data:" + type + ";base64," + file;
      resolve(file);
    });
  });
};


module.exports = {
  getFile,
  deleteFile
}
