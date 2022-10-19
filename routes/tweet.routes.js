const router = require('express').Router()
const verifyJWT = require('../middleware/verifyJWT');
const tweetsController = require('../controllers/tweets.controller')

router.get('/feed',verifyJWT,tweetsController.getFeed)

module.exports = router;