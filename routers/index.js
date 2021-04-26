const { Router } = require("express")
const vaildation = require("../middlewares")
const router = Router()

router.use("/auth", require("./auth"))
router.use("/board", vaildation, require("./Board"))
router.use("/comment", vaildation, require("./Comment"))
router.use("/member", require("./Member"))
router.use("/emoticon", vaildation, require("./Emoticon"))

module.exports = router