const { Router } = require("express")
const MemberRouter = Router()
const MemberController = require("./controller")

MemberRouter.get("/:userId", MemberController.getPostByMember)
MemberRouter.get("/", MemberController.getMembers)
// MemberRouter.get("/:postId", MemberController.getMemberByNickname)

module.exports = MemberRouter
