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
</div>
</details>
