const router = require('express').Router()
const tweetController = require('../controllers/tweet.controller')
const multer  = require('multer')
const storage = require('../config/multer.storage')
const upload = multer({ storage : storage })

//GET
router.get('/feed',tweetController.getFeed)
router.get('/get-tweet/:_id',tweetController.getTweet)
router.get('/get-comments/:_id',tweetController.getComments)
router.get('/get-user-tweets/:username',tweetController.getUserTweets)
//POST
router.post('/create-tweet',upload.array('files',4),tweetController.createTweet)
router.post('/add-comment',upload.array('files',4),tweetController.addComment)
//PATCH
router.patch('/like-tweet',tweetController.likeTweet) 
router.patch('/add-retweet',tweetController.addRetweet) 

module.exports = router;