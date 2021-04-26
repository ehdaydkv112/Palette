const mongoose = require("mongoose")
const { Types } = require("mongoose")
const { Schema } = mongoose
const emoticonSchema = new Schema(
  {
    emoji: { type: String, required: true },
    user: { type: Types.ObjectId, required: true, ref: "User" },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Emoticon", emoticonSchema)
