const google = require("./google_login")
const kakao = require("./kakao_login")

module.exports = () => {
  google()
  kakao()
}
