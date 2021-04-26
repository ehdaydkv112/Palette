const mongoose = require("mongoose")
const UserSchema = new mongoose.Schema(
  {
    nickname: { type: String, required: true },
    email: { type: String, required: true },
    password: String,
    comment_myself: { type: String, default: "안녕하세요." },
    profile_img: { type: String, required: true, default: " " },
    snsId: { type: Boolean },
  },
  {
    timestamps: true,
  }
)

UserSchema.virtual("userId").get(function () {
  return this._id.toHexString()
})

UserSchema.set("toJSON", {
  virtuals: true,
})

module.exports = mongoose.model("User", UserSchema)
