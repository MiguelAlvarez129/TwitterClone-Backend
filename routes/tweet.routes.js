const router = require('express').Router()
const tweetController = require('../controllers/tweet.controller')
const multer  = require('multer')
const storage = require('../config/multer.storage')
const upload = multer({ storage : storage })

//GET
router.get('/feed',tweetController.getFeed)
router.get('/get-tweet/:_id',tweetController.getTweet)
//POST
router.post('/create-tweet',upload.array('files',4),tweetController.createTweet)


module.exports = router;