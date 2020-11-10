const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, './images')
    },
    filename(req, file, callback) {
        callback(null, Math.random()* 999999999999999 + '-' + file.originalname)
    }
})

const allowedTypes = ['image/png', 'image/jpg', 'image/gif', 'image/jpeg']

const fileFilter = (req, file, callback) => {
    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true)
    } else {
        callback(null, false)
    }
}

module.exports = multer({storage, fileFilter})