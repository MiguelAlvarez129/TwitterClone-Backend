const router = require('express').Router()
const authController = require('../controllers/auth.controller')

// GET
router.get('/refresh',authController.refreshToken)

// POST
router.post('/register',authController.register)
router.post('/login',authController.login)


module.exports = router
