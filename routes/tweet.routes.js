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
router.post('/add-retweet',upload.array('files',4),tweetController.addRetweet) 
router.post('/like-tweet',tweetController.likeTweet) 
//PATCH 
//DELETE
router.delete('/remove-retweet',tweetController.removeRetweet)
router.delete('/remove-like',tweetController.removeLike)
module.exports = router;