const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
    {
        room: { type: String, },
        username: { type: String, },
        msg: { type: String },
        createdAt: { type: String },
        profile_img: { type: String }
    });

module.exports = mongoose.model("Chat", chatSchema);