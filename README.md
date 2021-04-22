# Palette
팀 프로젝트 팔렛트

## 목차
1. 기능
2. API
3. 코드
4. 느낀점

## 2. API 

  AUTH
    <details> <summary> </summary> <div markdown="1"> 
  ![image](https://user-images.githubusercontent.com/78591345/115645341-27cc8b80-a35b-11eb-8c19-a6d717f3538d.PNG)
     </div>
</details>
  
  BOARD
    <details> <summary> </summary> <div markdown="1"> 
  ![image](https://user-images.githubusercontent.com/78591345/115645346-28fdb880-a35b-11eb-83ec-24c6bb0801fa.PNG)
     </div>
</details>

  COMMENT
    <details> <summary> </summary> <div markdown="1"> 
  ![image](https://user-images.githubusercontent.com/78591345/115645347-28fdb880-a35b-11eb-94f6-a752f492093e.PNG)
   </div>
  </details>

 
 EMOTICON & MEMBER
    <details> <summary> </summary> <div markdown="1"> 
 ![image](https://user-images.githubusercontent.com/78591345/115645348-29964f00-a35b-11eb-9a84-ec1f7b849282.PNG)
 ![image](https://user-images.githubusercontent.com/78591345/115645349-29964f00-a35b-11eb-8dc2-8d7c9728dfd8.PNG)
    </div>
   </details>
   
   
   
   ## 3. 코드
   
   소셜 로그인 (구글)
<details> <summary> </summary> <div markdown="1">
  
  
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

 다음에 더 똑똑하게 문제를 해결할 수 있을 것이닿ㅎㅎㅎ

</div>
</details>


  비번 찾기 메일 보내기
<details> <summary> </summary> <div markdown="1">
  
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
