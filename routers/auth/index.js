const { Router } = require("express")
const passport = require("passport")
const jwt = require("jsonwebtoken")
const { User } = require("../../model")
const { emailCheck, userpasswordCheck } = require("./vaildation")
const bcrypt = require("bcrypt")
const authRouter = Router()
const middlewares = require("../../middlewares")
const upload = require("../imgUpload")
const nodemailer = require("nodemailer")

// 구글 시작
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

// 구글 콜백 함수
authRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  function (req, res) {
    const { _id } = req.user

    res.redirect("http://infoking.shop.s3-website.ap-northeast-2.amazonaws.com/social/" + _id)
  }
)

// 1. 서로 연결됐다는 정보만 가지고 있는 것
// 2. 인증이 되는 경우 패스포트 작용
// 3. 서버쪽 db만 바뀜

// 카카오 시작
authRouter.get(
  "/kakao",
  passport.authenticate("kakao", {
    failureRedirect: "/login",
  })
)

// 카카오 콜백
authRouter.get("/kakao/callback", (req, res) => {
  passport.authenticate("kakao", { failureRedirect: "/" }, (err, user) => {
    const { _id } = user
    return res.redirect("http://infoking.shop.s3-website.ap-northeast-2.amazonaws.com/social/" + _id)
  })(req, res)
})

// 회원가입
authRouter.post("/register", async (req, res, next) => {
  const { email, password } = req.body

  // 에러 처리
  if (!emailCheck(email) || !userpasswordCheck(password)) {
    res.status(400).send({ err: "비밀번호 혹은 아이디 형식이 틀렸습니다." })
  }
  const exUser = await User.findOne({ email })
  if (exUser) return res.status(400).send({ err: "이미 존재한는 유저입니다." })

  // 유저 정보 저장
  const hash = await bcrypt.hash(password, 12)
  const user = new User({ ...req.body, password: hash, snsId: false })
  try {
    await user.save()
    return res.send({ success: true })
  } catch (err) {
    console.log(err)
    next(err)
  }
})

// 이메일 확인
authRouter.post("/checkEmail", async (req, res, next) => {
  const { email } = req.body
  const exUser = await User.findOne({ email })
  if (exUser) return res.status(400).send({ err: "이미 존재하는 유저입니다." })
  return res.send({ success: true })
})

// 로그인
authRouter.post("/login", async (req, res, next) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) return res.status(400).send({ err: " 아이디 혹은 비밀번호가 틀렸습니다." })

  const result = await bcrypt.compare(password, user.password)
  if (!result) return res.status(400).send({ err: " 아이디 혹은 비밀번호가 틀렸습니다." })

  let date = new Date()

  payload = {
    iss: "taejin",
    sub: "insta",
    aud: user.userId,
    exp: date.setTime(date.getTime() + 5 * 60 * 60 * 1000),
    iat: date.getTime(),
    userId: user.userId,
  }

  const token = jwt.sign(payload, process.env.LOVE_TOKEN)
  return res.json({
    token: token,
    user: user,
  })
})

// 소셜 인증
authRouter.post("/me", async (req, res, next) => {
  const { id } = req.body
  const user = await User.findOne({ _id: id })

  let date = new Date()

  payload = {
    iss: "taejin",
    sub: "insta",
    aud: user.userId,
    exp: date.setTime(date.getTime() + 5 * 60 * 60 * 1000),
    iat: date.getTime(),
    userId: user.userId,
  }

  const token = jwt.sign(payload, process.env.LOVE_TOKEN)
  res.json({
    token: token,
    user: user,
  })
})

// 체크하기 //
authRouter.get("/user", async (req, res) => {
  const { token } = req.headers
  payload = jwt.verify(token, process.env.LOVE_TOKEN)

  const userInfo = await User.findOne({ _id: payload.userId })
  delete userInfo.password

  res.send({ userInfo })
})

// 프로필 수정ㅎㅎ
authRouter.patch("/myProfile", middlewares, upload.single("profile_img"), async (req, res) => {
  const userId = res.locals.user
  const { password, comment_myself, profile_img } = req.body
  const imgUrl = req.file && `http://wcd21.shop${req.file.filename}`

  // 비번은 바꿧을 때
  if (password !== "null") {
    const hash = await bcrypt.hash(password, 12)
    const newUserInfo = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...req.body,
          profile_img: imgUrl,
          password: hash,
        },
      },
      {
        new: true,
      }
    )
    delete newUserInfo.password
    return res.send({ newUserInfo })
  }
  // 비번 안 바꿨을 때
  else {
    // 처음 프로필 이미지 아무것도 없을때 변경시
    if (userId.profile_img == " ") {
      const newUserInfo = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            comment_myself: comment_myself,
            profile_img: imgUrl,
          },
        },
        {
          new: true,
        }
      )
      delete newUserInfo.password
      return res.send({ newUserInfo })
    } else if (typeof profile_img == String) {
      const newUserInfo = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            comment_myself: comment_myself,
            profile_img: profile_img,
          },
        },
        {
          new: true,
        }
      )
      delete newUserInfo.password
      return res.send({ newUserInfo })
    }
    // 비번은 안바꾸고, 이미지만 바꿨을 떄
    else {
      const newUserInfo = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            comment_myself: comment_myself,
            profile_img: imgUrl,
          },
        },
        {
          new: true,
        }
      )
      delete newUserInfo.password
      return res.send({ newUserInfo })
    }
  }
})

// 비번 찾기
authRouter.post("/searchPwd", async (req, res) => {
  // sns는 비번찾기 못 이용하게 해야함

  const { email } = req.body
  const randomString = Math.random().toString(36).slice(2)

  const hash = await bcrypt.hash(randomString, 12)

  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.LOVE_MAIL_ID,
      pass: process.env.LOVE_MAIL_PW,
    },
  })

  let info = await transporter.sendMail({
    // 보내는 곳의 이름과, 메일 주소를 입력
    from: `"F4 TEAM" <${process.env.LOVE_MAIL_ID}>`,
    to: email,
    subject: "Pallet 임시 비밀번호입니다^^",
    text: randomString,
  })

  await User.updateOne({ email }, { $set: { password: hash } })

  return res.send("비번찾기 완료^^ㅋ")
})

module.exports = authRouter