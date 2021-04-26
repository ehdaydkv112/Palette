const { Router } = require("express")
const EmoRouter = Router()
const EmoController = require("./controller")

EmoRouter.patch("/:postId", EmoController.createEmoticon)
EmoRouter.delete("/:postId", EmoController.deleteEmoticon)

module.exports = EmoRouter