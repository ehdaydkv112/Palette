const { Router } = require("express")
const BoardRouter = Router()
const BoardController = require("./cotroller")
const vaildation = require("../../middlewares")
const upload = require("../imgUpload")

BoardRouter.get("/:postId", BoardController.getPostByID)
BoardRouter.get("/", BoardController.getPosts)
BoardRouter.post("/", upload.single("BoardImg"), BoardController.createPost)
BoardRouter.patch("/:postId", upload.single("BoardImg"), BoardController.editPost)
BoardRouter.delete("/:postId", BoardController.deletePost)

module.exports = BoardRouter
