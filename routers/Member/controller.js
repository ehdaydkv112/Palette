const { User, Post } = require("../../model")
const userSelect = ["nickname", "comment_myself", "profile_img", "_id", "email"]
const userSelectMini = ["nickname", "email", "profile_img"]

// 닉넴 정렬, 알파벳
function custonSort(a, b) {
  if (a.nickname.toLowerCase() == b.nickname.toLowerCase()) {
    return 0
  }
  return a.nickname.toLowerCase() > b.nickname.toLowerCase() ? 1 : -1
}

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

exports.getMembers = async (req, res, next) => {
  try {
    let ousers = await User.find({}).select(userSelect)
    let users = ousers.sort(custonSort)

    return res.send({ users })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

exports.getMemberByNickname = async (req, res, next) => {
  const { nickname } = req.params
  try {
    const user = await User.findOne({ nickname }).select(userSelect)
    if (!user) return res.status(400).send({ err: "존재하지 않는 사람입니다." })
    return res.send({ user })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

exports.getPostByMember = async (req, res, next) => {
  const { userId } = req.params
  try {
    const posts = await Post.find({ user: userId })
      .populate([
        { path: "user", select: userSelectMini },
        { path: "emoticon", populate: { path: "user", select: userSelectMini } },
        { path: "comment", populate: { path: "user", select: userSelectMini } },
      ])
      .sort("-createdAt")
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