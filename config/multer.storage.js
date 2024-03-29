const multer = require('multer')
const fs = require('fs').promises
const path = require('path')
const crypto = require('crypto')
module.exports = multer.diskStorage({
  destination: async (req, file, cb) => {
    await fs.mkdir(path.resolve(__dirname,`../public/uploads/${req.user.username}/${req.body.type}`),{recursive:true},err=>{
      if (err && err.code === 'EEXIST') return;
    else if (err) throw err
    })
    cb(null, `./public/uploads/${req.user.username}/${req.body.type}`)
  },
  filename: function (req, file, cb) {
    const fileExt = file.mimetype.split('/')[1]
    if (req.body.type === 'profile'){
      const hash = crypto.randomBytes(4).toString('hex')
      req.path = `/${req.user.username}/${req.body.type}/${file.fieldname}-${hash}.png`
      cb(null, file.fieldname + '-' + hash + '.' + 'png')
    } else {
      req.path = `/${req.user.username}/${req.body.type}/${file.fieldname}`
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + fileExt)
    }
  }
})