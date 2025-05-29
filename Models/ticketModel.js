const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema(
  {
   
    clientname: { type: String, required:true},
    receivername: { type: String, required:true},
    clientemail: { type: String, required:true},
    receiveremail: { type: String, required:true},
     chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chats" }],
   
    
  },
  { timestamps: true }
);

const Tickets = mongoose.model("Tickets", TicketSchema);
module.exports = Tickets;
