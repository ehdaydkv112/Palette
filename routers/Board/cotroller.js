const { Post, Comment, Emoticon } = require("../../model")
const userSelect = ["comment_myself", "profile_img", "_id", "email", "nickname"]
const userSelectMini = ["nickname", "email", "profile_img"]
const emoticonSelect = ["emoji", "user"]

function makeEmojiCounter(emoticon) {
  const counter = new Map()
  let emoji = emoticon.reduce((tot, val) => {
    const res = tot.get(val["emoji"])
    res ? res.push(val["user"]["_id"]) : tot.set(val["emoji"], [val["user"]["_id"]])
    return tot
  }, counter)

  emoji = Object.fromEntries(emoji.entries())
  res = []
  for (let key in emoji) {
    const temptobj = {}
    temptobj[key] = emoji[key]
    temptobj["emoticon"] = key
    res.push(temptobj)
  }
  return res
}

exports.getPostByID = async (req, res, next) => {
  const { postId } = req.params
  try {
    const post = await Post.findOne({ _id: postId }).populate([
      { path: "user", select: userSelect },
      {
        path: "emoticon",
        populate: { path: "user", select: ["nickname"] },
      },
      { path: "comment", populate: { path: "user", select: userSelectMini } },
    ])
    const emoji = makeEmojiCounter(post.emoticon)
    return res.send({ post, emoji })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

exports.getPosts = async (req, res, next) => {
  let { page } = req.query
  page = (page - 1 || 0) < 0 ? 0 : page - 1 || 0

  try {
    const posts = await Post.find({})
      .populate([
        { path: "user", select: userSelect },
        {
          path: "emoticon",
          select: emoticonSelect,
          populate: { path: "user", select: userSelectMini },
        },
        { path: "comment", populate: { path: "user", select: userSelectMini } },
      ])
      .sort("-createdAt")
      .skip(page * 3)
      .limit(3)

    // 새로운 이모티콘 별 사람들의 아이디 작성해서 보내주기
    const newPost = posts.map((post) => {
      emoji = makeEmojiCounter(post.emoticon)
      return { post, emoji }
    })
    return res.send({ posts: newPost })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

exports.createPost = async (req, res, next) => {
  const { content } = req.body
  const { userId } = res.locals.user
  if (typeof content !== "string")
    return res.status(400).send({ err: "내용이 형식에 맞지 않습니다." })

  const imgUrl = req.file && `http://wcd21.shop${req.file.filename}`

  const post = new Post({ ...req.body, imgUrl, user: userId })
  try {
    await post.save()
    return res.send({ post })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

exports.editPost = async (req, res, next) => {
  const { postId } = req.params
  const userId = res.locals.user.userId

  const imgUrl = req.file && `http://wcd21.shop${req.file.filename}`

  try {
    const post2 = await Post.findOne({ _id: postId })
    if (!post2.user.equals(userId))
      return res.status(400).send({ err: "사용자와 글쓴이가 다릅니다." })

    const post = await Post.findByIdAndUpdate(postId, { ...req.body, imgUrl }, { new: true })
    return res.send({ post })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

exports.deletePost = async (req, res, next) => {
  const { postId } = req.params
  const userId = res.locals.user.userId
  try {
    const post = await Post.findOne({ _id: postId })
    if (!post.user.equals(userId))
      return res.status(400).send({ err: "사용자와 글쓴이가 다릅니다." })
    await Promise.all([
      Post.deleteOne({ _id: postId }),
      Comment.deleteMany({ _id: { $in: [...post.comment] } }),
      Emoticon.deleteMany({ _id: { $in: [...post.emoticon] } }),
    ])
    return res.send({ success: true })
  } catch (err) {
    console.log(err)
    next(err)
  }
}
