const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema(
  {
    ticketNO: { type: String, required: true },
    clientname: { type: String, required: true },
    receivername: { type: String, required: true },
    clientemail: { type: String, required: true },
  status: { type: Boolean, required: true, default: false },
    receiveremail: { type: String, required: true },
    subject: { type: String, required: true },
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chats" }],
  },
  { timestamps: true }
);

const Tickets = mongoose.model("Tickets", TicketSchema);
module.exports = Tickets;
