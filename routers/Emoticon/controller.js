const { Emoticon, Post } = require("../../model")
const emoticon = require("../../model/emoticon")

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

exports.createEmoticon = async (req, res, next) => {
  const { postId } = req.params
  const { userId } = res.locals.user
  const emoticon = new Emoticon({
    ...req.body,
    user: userId,
  })
  try {
    const [emo, post] = await Promise.all([
      emoticon.save(),
      Post.findByIdAndUpdate(
        postId,
        {
          $push: { emoticon: emoticon._id },
        },
        { new: true }
      ).populate([
        {
          path: "emoticon",
          populate: { path: "user", select: ["nickname"] },
        },
      ]),
    ])
    const emoji = makeEmojiCounter(post.emoticon)
    return res.send({ post, emoticon, emoji })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

exports.deleteEmoticon = async (req, res, next) => {
  const { postId } = req.params
  const { userId } = res.locals.user
  const { emoji } = req.body

  // 에러 감지
  if (typeof emoji !== "string")
    return res.status(400).send({ err: "emoji의 형식이 잘못되었습니다." })

  const posts = await Post.findById(postId).populate([{ path: "emoticon" }])

  //이모티콘 찾기
  let emojiId
  posts.emoticon.forEach((emo_info) => {
    if (emo_info["emoji"] === emoji && emo_info["user"].equals(userId)) {
      emojiId = emo_info._id
    }
  })
  if (!emojiId) return res.status(400).send({ err: "포스터에 없는 이모티콘입니다." })

  try {
    await Promise.all([
      Emoticon.findByIdAndDelete(emojiId),
      Post.findByIdAndUpdate(postId, {
        $pull: { emoticon: { _id: emojiId } },
      }),
    ])
    return res.send({ success: true })
  } catch (err) {
    console.log(err)
    next(err)
  }
}