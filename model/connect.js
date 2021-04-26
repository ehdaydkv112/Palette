const { test } = require("media-typer")
const mongoose = require("mongoose")

const dbConnect = () => {
  const url = "mongodb://localhost:27017/slack"
  //서버는 slack -> admin으로 배포했음
  mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      ignoreUndefined: true,
      useFindAndModify: false,
      // user: "test",
      // pass: "test",
    })
    .then(() => {
      console.log("connet success")
    })
    .catch((err) => console.log(err))
}

module.exports = dbConnect
