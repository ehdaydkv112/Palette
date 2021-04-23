# Palette
<b> 팀 프로젝트 팔렛트 </b>

유튜브 영상 : https://www.youtube.com/watch?v=8IvPPMpnCZ4

주소 : http://infoking.shop.s3-website.ap-northeast-2.amazonaws.com/main

![image](https://user-images.githubusercontent.com/78591345/115690495-1190f080-a398-11eb-8623-cb1518bd51e4.PNG)

</br>

## 목차
1. 기능
2. API
3. 코드
4. 느낀점

</br>

## 1. 기능

1. 소셜 로그인
2. 게시글, 댓글 CRUD
3. 비번 찾기 이메일 보내기
4. 무한 이모티콘
5. 이모티콘 좋아요 기능
6. 웹소켓io 1:1 대화

</br>

## 2. API

<details>
<summary>AUTH
</summary>
<div markdown="1">    
  
  ![image](https://user-images.githubusercontent.com/78591345/115645341-27cc8b80-a35b-11eb-8c19-a6d717f3538d.PNG)
     </div>
</details>
</br>
  
<details>
<summary>BOARD
</summary>
<div markdown="1">
  
  ![image](https://user-images.githubusercontent.com/78591345/115645346-28fdb880-a35b-11eb-83ec-24c6bb0801fa.PNG)
     </div>
</details>
</br>


<details>
<summary>COMMENT
</summary>
<div markdown="1">

  ![image](https://user-images.githubusercontent.com/78591345/115645347-28fdb880-a35b-11eb-94f6-a752f492093e.PNG)
   </div>
  </details>
</br>

 
 <details>
<summary> EMOTICON & MEMBER
</summary>
<div markdown="1">

 ![image](https://user-images.githubusercontent.com/78591345/115645348-29964f00-a35b-11eb-9a84-ec1f7b849282.PNG)
 ![image](https://user-images.githubusercontent.com/78591345/115645349-29964f00-a35b-11eb-8dc2-8d7c9728dfd8.PNG)
    </div>
   </details>
   </br>
   
   
   
   ## 3. 코드
   
   
<details>
<summary> 소셜 로그인 (구글)
</summary>
<div markdown="1">
  
  ![image](https://user-images.githubusercontent.com/78591345/115690122-b3fca400-a397-11eb-9929-c500ecdc202e.PNG)
  
  
 ```js
// 구글 시작
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))


// 패스포트
const GoogleStrategy = require("passport-google-oauth20").Strategy
passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})

module.exports = () => {
  passport.use(

    new GoogleStrategy(
      {
        clientID: process.env.LOVE_GOOGLE_ID,
        clientSecret: process.env.LOVE_GOOGLE_PW,
        callbackURL: `http://wcd21.shop/auth/google/callback`,
      },

      async (accessToken, refreshToken, profile, cb) => {
        
        const {
          _json: { id, avatar_url, name, email },
        } = profile

        try {
          const user = await User.findOne({ email: email })
          if (user) {
            return cb(null, user)
          } else {
            const newUser = new User({
              email,
              nickname: name,
              snsId: true,
            })
            await newUser.save()
            return cb(null, newUser)
          }
        } catch (error) {
          return cb(error)
        }
      }
    )
  )
}


// 구글 콜백 함수
authRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  function (req, res) {
    const { _id } = req.user

    res.redirect("http://localhost:3000/social/" + _id)
  }
)
```

<a>태그로 요청이 들어오면, 구글로 부터 인증을 받는다. 그 후 구글의 profile에서 필요한 정보를 내려 받는다.
  
소셜 로그인 정보를 DB에 담아야 함으로,

  DB에 이미 있는 경우와 없는 경우를 분기처리한 후, 콜백 함수로 넘긴다.
  
  콜백 함수에서는 리다이렉트를 이용해 페이지를 이동시킨다.
  
  여기서 문제가 있었는데, 정상적인 방법은 아닌 것 같지만, 일단 임시방편으로 해결했다.
  
소셜 로그인 요청은 a태그로 받아야한다. axios와 ajax를 이용한 RestfulAPI를 이용할 수 없다고 한다.
  
 그래서 res.send를 이용한 서버 자체 토큰을 내려줄 수 없었다. res.cookie를 이용한 강제로 쿠키에 토큰을 심는 방식도 있었지만 이렇게 해결했다.
 
  1. 리다이렉트를 이용하여 DB에 저장된 소셜 로그인 유저의 고유값인 _id를 클라이언트에 주소 값으로 넘긴다.
  2. 클라이언트는 주소 뒤에있는 _id를 받은 후 API를 한 번 더 요청하며, 서버에 _id를 보낸다.
  3. 서버는 _id를 통해 자체 jwt토큰을 반환한다.

 카카오톡, 구글 둘 다 이렇게 처리했다...
 
 다음에 더 똑똑하게 문제를 해결할 수 있겠짛ㅎㅎㅎ

</div>
</details>
</br>


<details>
<summary> 비번 찾기 메일 보내기
</summary>
<div markdown="1">
  
  ![image](https://user-images.githubusercontent.com/78591345/115690110-b101b380-a397-11eb-9cf7-d4bba8d69720.PNG)
  
 ```js
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

 ```

bcrypt는 단방향 이라서, 복호화가 불가능했다. 처음엔 가능한 줄 알고 이상한 쇼를 했다.

그래서 임시 비밀번호를 가입된 이메일로 보내준다.

노드 메일러라는 npm을 이용해서, 가입된 이메일에게 보낼 수 있다.

임시 비밀번호를 받은 사람은 비밀번호 변경을 이용하여 비밀 번호를 바꿀 수 있다.
  
 
</div>
</details>
</br>

<details>
<summary> 프로필 변경
</summary>
<div markdown="1">

  
  ![image](https://user-images.githubusercontent.com/78591345/115690111-b232e080-a397-11eb-8b91-bbb79904c4fe.PNG)

 ```js
 
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

 ```
 
 분기처리하기가 조금 까다로웠다.
 
 프로필 변경 하나에 비밀번호, 프로필이미지, 상태메시지 동시에 변경이 가능했고,
 
 비밀번호를 입력 안 할 경우엔, 기존 비밀번호를 유지해야했다.
 
 다른 것도 마찬가지로, 입력 안 할 경우엔 기존 것을 유지해야했다.
 
 여기서 SNS ID는 비밀번호가 DB에 저장될 떄 부터 없기 때문에, SNS일 경우를 따로 생각해야했고,
 
 처음 프로필 이미지가 없을 경우는 기존 이미지가 스트링으로 안 넘어 오기 때문에, 따로 생각해야했다.
 
 그래서 야생 코딩했다ㅎㅎㅎㅎ..
 
 
 </div>
</details>
</br>



<details>
<summary> 무한 스크롤
</summary>
<div markdown="1">
  
  ![image](https://user-images.githubusercontent.com/78591345/115690495-1190f080-a398-11eb-8623-cb1518bd51e4.PNG)

 ```js

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
      .skip(page * 5)
      .limit(5)

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

 ```
 
클라가 쿼리로 보내준다. 주소/주소?page=number

여기서 number값을 받아서, 스킵한다.

populate 끝난 후에, skip을 통해 page * 5만큼 DB를 스킵한다.

그 다음 limit으로 꺼낼 것을 5개로 제한한다.

이런 식으로 DB에서 5개씩만 꺼내서, 클라이언트한테 보내준다.

클라이언트는 스크롤이 닿는 등 이벤트가 발생할 때마다 API를 요청하여, 5개씩 받아가면 될 것이다.

프론트에서 어떻게 처리했는진 모르지만 프론트분 말로는 막막 굉장히 어려운 작업이었다고 한다.
 
 
  </div>
</details>
</br>




<details>
<summary> 이모티콘
</summary>
<div markdown="1">
  
  ![image](https://user-images.githubusercontent.com/78591345/115690121-b3640d80-a397-11eb-9b91-07fc8ebf6dc9.png)
 
 ```js

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
```

이모티콘의 경우 포스터에 이모티콘이 담겨서 넘오기 때문에 포스터에 이모티콘 배열을 만들어서 이모티콘을 넣었습니다.

프론트분들이 원하는 데이터가 있어서 데이터 정제 작업이 필요했습니다. 

데이터의 내용은 이모티콘별 어떤 사용자들이 존재하는지에 대한 데이터를 위해서 함수를 만들었습니다.

{ 😊 : ["사용자 id" , "사용자 id"] emoticon : 😊}


  </div>
</details>
</br>




<details>
<summary> S3 이미지 업로드
</summary>
<div markdown="1">
  
  ![image](https://user-images.githubusercontent.com/78591345/115691149-bc091380-a398-11eb-8a54-12470f333392.PNG)

```js

const AWS = require("aws-sdk")
const multerS3 = require("multer-s3")
const multer = require("multer")
const path = require("path")

const s3 = new AWS.S3({
  accessKeyId: process.env.LOVE_S3_ID,
  secretAccessKey: process.env.LOVE_S3_PW,
  // region: "ap-northeast-2",
})

const S3storage = multerS3({
  s3,
  bucket: "informationking",
  key(req, file, cb) {
    cb(null, `original/${Date.now()}${path.basename(file.originalname)}`)
  },
})

const serverStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "public/")
  },
  filename(req, file, cb) {
    cb(null, `/${Date.now()}${path.basename(file.originalname)}`)
  },
})

const fileFilter = function (req, file, cb) {
  let typeArray = file.mimetype.split("/")
  let fileType = typeArray[1]
  const imgFileExtention = new RegExp("(gif|jpe?g|png|)")
  const res = imgFileExtention.test(fileType)
  return res ? cb(null, true) : cb(null, false)
}

const upload = multer({
  storage: serverStorage,
})

module.exports = upload
```


기존의 serverStorage의 경우 destination과 filename을 작성했다면 

S3는 어떤 S3를 쓸건지 accesskey와 secretAccessKey를 넣는다. 또한 S3에서 정한 bucket에 대한 이름을 작성하고

key에는 파일의 이름을 작성하여 그 파일의 파일이름을 작성하게 되면 

router에서는 req.file로 file를 접근 할 수 있게됩니다. 

  </div>
</details>
</br>


<details>
<summary> 1:1 대화 Socket
</summary>
<div markdown="1">
  
  ![image](https://user-images.githubusercontent.com/78591345/115690114-b2cb7700-a397-11eb-92b0-79eccaf904db.png)
  
  ```js

const socketIo = require("socket.io")
const { Chat, User } = require("./model")
const moment = require("moment")
require("moment-timezone")
moment.tz.setDefault("Asia/Seoul")

module.exports = async (http, app) => {
  const io = socketIo(http, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  const chat = io.of("/chat")
  const global = io.of("/")

  chat.on("connection", function (socket) {
    socket.on("join", async function (data) {
      const req = socket.request
      const {
        headers: { referer },
      } = req
      console.log(referer)
      const { room, username } = data
      // room에 join한다
      socket.join(room)
      // room에 join되어 있는 클라이언트에게 메시지를 전송한다
      const chats = await Chat.find({ room: room })
      chat.to(room).emit("load", chats)
    })

    socket.on("send", async function (data) {
      const { room } = data
      const content = new Chat({
        ...data,
        createdAt: moment().format("YYYY-MM-DD-HH:mm"),
      })
      await content.save()
      chat.to(room).emit("receive", content)
    })

    socket.on("leave", (data) => {
      console.log("leave")
      socket.leave(data.room)
    })

    socket.on("disconnect", () => {
      console.log("disconnect")
    })
  })

  global.on("connection", function (socket) {
    socket.on("globalSend", async function (data) {
      console.log(data)
      global.emit("globalReceive", data)
    })
  })
}
```

소켓io를 공부를 해가면서 동시에 개발한 거라 미숙한 점이 많았다.

처음엔 이해가 명확하게 가지 않아서, 어려움을 겪었지만, 예제 파일과 함께 공부하니 조금이나마 이해가 갔다.

클라이언트와 처음 합을 맞춰보고 성공했을 때 모두 소리질렀다 오예 ~~~~

chat, global 두 개의 소켓을 열고,

1. 채팅을 시작하면 chat소켓을 열고, 룸을 입장시켰다.

2. 룸은 대화를 하고 있는 두 사람의 DB 고유값인 _id를 _id-_id 이런 식으로 룸 번호를 지정했다.

3. 그리고 DB에는 룸, 채팅내역, 닉네임, 시간을 저장했고,

4. room에 입장할 때마다, 그 룸에 해당하는 이전 채팅내역을 뿌렸다.

global 소켓은 클라이언트 쪽에서 요구해서 뿌렸는데,

이를 활용하여 채팅 알람기능을 구현했다.

global 소켓이 활성화 되었는데, 본인으 _id가 거기에 속해있고, chat소켓은 활성화가 안 되어 있는 상황이라면

나에게 채팅이 왔지만, 내가 확인을 안 한 것으로 판단하고 빨간색 뱃지가 달린다.

알람 이 부분은 굉장히 난해하고, 프론트가 고생을 정말 많이했다. 유진님짱

지금도 막 완벽하진 않지만 어느정도 돌아간다.



  </div>
</details>

</br>

## 4. 느낀점

<b> 강태진 </b>

처음으로 팀플다운 협업을 한 것 같다. 매의 눈 노유진님과 따뜻한 심장 교석님.. 하은이 아빠 형석님.. 2주간 행복하게 협업했다.

그동안 '기능만 돌아가면 되지ㅋ' 하며 야생 코딩을 하던 내가 정규 검객들을 만나서.. 재밌게 배울 수 있던 시간이었다.

그리고 제일 중요했던건 보안에 대해서 확실히 깨달았다.

중간에 S3가 해킹 당해서, 63만원인가가 나왔는데, AWS에서 잘 해결해줬다. 정말 리얼로 이제 보안왕이 되어야겠다고 다짐했당.

프론트와 백 모두 즐겁게 협업했다.

너무 재밌었고, 기존에 하던 코딩 방식을 벗어나서, 새롭게 배운 것 같아서 넘 즐거웠다.

다음에 사이드프로젝트 꼭~~~ 같이 하기로헀다. 하하하

---

<b> 금교석 </b>

재미있는 경험들을 많이했다. 최고의 프론트분들과 야생코딩의 왕 타잔 태진님과 함께 작업하니 2주간 빠르게 재미있게 코딩했습니다..

암호화 , S3에 이미지 업로드 , 소켓 IO, 견고한 예외처리를 통해서 챌린지 한 것들을 많이 시도했다. 원래 계획은 일찍 끝나고 많은 스택들을

공부하려고 했지만 그래도 굉장히 많은 것들을 배우게 되었습니다. 다음에도 이 팀분들과 사이드 프로젝트를 하고 싶습니다.
