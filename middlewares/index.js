const jwt = require("jsonwebtoken")
const User = require("../model/user")
require('dotenv').config()

// 이거 3번째에 모듈로 안 넣어줘도 적용되는거 물어보기
// (req, res, authmiddlewares) 이렇게 안 해도 되는 듯
module.exports = (req, res, next) => {
    const { token } = req.headers
    console.log(token)

    if (!token) {
        res.status(401).send({
            errorMessage: "로그인 후 이용 가능한 기능입니다.",
        })
        return
    }
    try {
        const { userId } = jwt.verify(token, process.env.LOVE_TOKEN)
        User.findById(userId).then((user) => {
            res.locals.user = user
            console.log("유저인증 성공!")
            next()
        })
    } catch (err) {
        res.status(401).send({
            errorMessage: "22로그인 후 이용 가능한 기능입니다.",
        })
    }
}
