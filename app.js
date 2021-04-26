const express = require("express")
const connect = require("./model/connect")
const router = require("./routers")
// const User = require("./schemas/user");
// const jwt = require("jsonwebtoken");
const cookie = require("cookie-parser")

const morgan = require("morgan")
const passport = require("passport")
const passportConfig = require("./passport")
const cors = require("cors")
// const path = require("path");
const { Server } = require("http")
const socket = require("./socket")
require("dotenv").config()

connect() //기본적으로 몽고디비랑 연결을 해준다.

const app = express()
const http = Server(app)
socket(http, app)

app.use(cors({ origin: "*", credentials: true }))
app.use(cookie())
app.use(express.json())
app.use(passport.initialize())
app.use(morgan("combined"))
passportConfig()
app.use(passport.session())
app.use(router)
app.use("/", express.static("public"))
app.use(express.urlencoded({ extended: false }))

// views 폴더랑 연결해주기 // ejs 모듈
app.set("views", __dirname + "/views")
app.set("view engine", "ejs")

// 로그인 페이지 이동
app.get("/", (req, res) => {
  res.render("login")
})

// 소켓 실험용
app.get("/socket", function (req, res) {
  res.render("socketPrac")
})

// 회원가입 페이지 이동
app.get("/register", (req, res) => {
  res.render("register")
})

// /home 하면 index.ejs로 감
app.get("/home", (req, res) => {
  res.render("index")
})

// /게시글 작성 페이지 이동하기
app.get("/write", (req, res) => {
  res.render("write")
})

app.get("/detail", (req, res) => {
  res.render("detail")
})

app.get("/fix", (req, res) => {
  res.render("fix")
})

// 에러
app.use((err, req, res, next) => {
  console.log(err)
  console.log("에러야에러야")
  res.send("에러 났지롱, 근데 안 알려주지롱!")
})

http.listen(3000, () => {
  console.log("서버가 요청을 받을 준비가 됐어요")
})

module.exports
