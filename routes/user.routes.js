const router = require('express').Router();
const userController = require('../controllers/user.controller')
const multer = require('multer')
const storage = require('../config/multer.storage')
const upload = multer({ storage : storage })
//GET
router.get('/users-list',userController.getUsersList)
router.get('/get-user/:username',userController.getUser)
//PATCH
router.patch('/update-profile-settings',upload.fields([{ name: 'profile', maxCount: 1 }, { name: 'bg', maxCount: 1 }]),userController.updateProfile)
module.exports = router;      