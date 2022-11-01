const router = require('express').Router();
const userController = require('../controllers/user.controller')
//GET
router.get('/users-list',userController.getUsersList)

module.exports = router;