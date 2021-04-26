const { Comment, Post } = require("../../model")
const userSelect = ["comment_myself", "profile_img", "_id", "email", "nickname"]
const userSelectMini = ["profile_img", "nickname", "email"]

// 댓글 작성
// method : post
// url : /comment/:postId
exports.createComment = async (req, res) => {
  const { postId } = req.params
  const _id = res.locals.user._id
  const saveComment = await Comment.create({
    ...req.body, // 변수가 똑같으면 들어옴ㅎ
    user: _id, // 로우 한 줄을 불러 감
  })

  const newPost = await Post.findByIdAndUpdate(
    postId,
    {
      $push: { comment: saveComment._id },
    },
    {
      new: true, // 이거 하면 썌거로 주는구나
    }
  )

  const newComment = await Comment.findOne({ _id: saveComment._id }).populate([
    { path: "user", select: userSelect },
    {
      path: "emoticon",
      populate: { path: "user" },
    },
    { path: "comment", populate: { path: "user", select: userSelect } },
  ])
  res.send({ newComment })
}

// 댓글 삭제
// method : delete
// url : /comment
exports.deleteComment = async (req, res) => {
  const { userId } = res.locals.user

  const { commentId, postId } = req.body

  const comment = await Comment.findOne({ _id: commentId })
  if (!comment.user.equals(userId)) {
    return res.status(400).send({ err: "사용자와 글쓴이가 다릅니다." })
  }

  await Comment.deleteOne({ _id: commentId })

  const newPost = await Post.findByIdAndUpdate(postId, {
    $pull: { comment: commentId },
  })
  res.send({ success: true })
}

// 댓글 수정
// method : patch
// url : /comment
exports.fixComment = async (req, res) => {
  const userId = res.locals.user.userId
  const { commentId, content } = req.body
  const comment = await Comment.findOne({ _id: commentId })
  if (!comment.user.equals(userId)) {
    return res.status(400).send({ err: "사용자와 글쓴이가 다릅니다." })
  }
  const updateComment = await Comment.updateOne({ _id: commentId }, { content }, { new: true })
  res.send({ updateComment })
}

// 댓글 읽기
// method: get
// url : /comment/:postId
exports.getComment = async (req, res) => {
  const { postId } = req.params
  try {
    const post = await Post.findById(postId).populate([
      { path: "comment", populate: { path: "user", select: userSelectMini } },
    ])
    return res.send({ comments: post.comment })
  } catch (err) {
    console.log(err)
    next(err)
  }
}