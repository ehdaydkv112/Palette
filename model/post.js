const mongoose = require("mongoose")
const { Types } = require("mongoose")
const { Schema } = mongoose

const postSchema = new Schema(
  {
    content: { type: String, required: true },
    url: { type: String },
    imgUrl: { type: String },
    user: { type: Types.ObjectId, required: true, ref: "User" },
    emoticon: { type: [{ type: Types.ObjectId, required: true, ref: "Emoticon" }] },
    comment: { type: [{ type: Types.ObjectId, required: true, ref: "Comment" }] },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Post", postSchema)
