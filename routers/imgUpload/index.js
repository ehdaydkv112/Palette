const AWS = require("aws-sdk")
const multerS3 = require("multer-s3")
const multer = require("multer")
const path = require("path")

const s3 = new AWS.S3({
  accessKeyId: process.env.LOVE_S3_ID,
  secretAccessKey: process.env.LOVE_S3_PW,
  // region: "ap-northeast-2",
})

const S3storage = multerS3({
  s3,
  bucket: "informationking",
  key(req, file, cb) {
    cb(null, `original/${Date.now()}${path.basename(file.originalname)}`)
  },
})

const serverStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "public/")
  },
  filename(req, file, cb) {
    cb(null, `/${Date.now()}${path.basename(file.originalname)}`)
  },
})

const fileFilter = function (req, file, cb) {
  let typeArray = file.mimetype.split("/")
  let fileType = typeArray[1]
  const imgFileExtention = new RegExp("(gif|jpe?g|png|)")
  const res = imgFileExtention.test(fileType)
  return res ? cb(null, true) : cb(null, false)
}

const upload = multer({
  storage: serverStorage,
})

module.exports = upload
