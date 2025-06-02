const mongoose = require("mongoose");

const ChatsSchema = new mongoose.Schema(
  {
    TicketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tickets",
      required: true,
    },
    senderemail: { type: String, required: true },
    receiveremail: { type: String, required: true },
    receivername: { type: String, required: true },
    message: { type: String },
    file: { type: String },
    fileName: { type: String },
  },
  { timestamps: true }
);

const Chats = mongoose.model("Chats", ChatsSchema);
module.exports = Chats;
