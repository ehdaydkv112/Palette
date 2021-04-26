const { Router } = require("express")
const CommentRouter = Router()
const CommentController = require("./controller")
const middlewares = require("../../middlewares")

CommentRouter.get("/:postId", middlewares, CommentController.getComment)
CommentRouter.post("/:postId", middlewares, CommentController.createComment)
CommentRouter.delete("/:postId", middlewares, CommentController.deleteComment)
CommentRouter.patch("/:postId", middlewares, CommentController.fixComment)

module.exports = CommentRouter