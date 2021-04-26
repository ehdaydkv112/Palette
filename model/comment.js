const mongoose = require("mongoose")
const { Types } = require("mongoose")

const commentSchema = new mongoose.Schema(
  {
    content: { type: String },
    user: { type: Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Comment", commentSchema)
