const passport = require("passport")
const KakaoStrategy = require("passport-kakao").Strategy
const { User } = require("../model")

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.LOVE_KAKAO_ID,
        callbackURL: "http://wcd21.shop/auth/kakao/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const exUser = await User.findOne({ email: profile._json.kakao_account.email })
          if (exUser) {
            return done(null, exUser)
          } else {
            const newUser = await User({
              email: profile._json && profile._json.kakao_account.email,
              nickname: profile.displayName,
              snsId: true,
            })
            await newUser.save()
            return done(null, newUser)
          }
        } catch (error) {
          console.error(error)
          done(error)
        }
      }
    )
  )
}
