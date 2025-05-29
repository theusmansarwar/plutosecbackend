const Chats = require("../Models/chatsModel");
const Tickets = require("../Models/ticketModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage});
const addMessage = async (req, res) => {
  try {
    const { TicketId, message, senderemail,receiveremail,fileName } = req.body;
    const file = req.file ? `/uploads/${req.file.filename}` : null;
    const missingFields = [];

    if (!TicketId)
      missingFields.push({ name: "TicketId", message: "TicketId is required" });

    if (!senderemail)
      missingFields.push({ name: "senderemail", message: "Sender email is required" });
 if (!receiveremail)
      missingFields.push({ name: "receiveremail", message: "receiver email is required" });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Some fields are missing!",
        missingFields,
      });
    }

    const ticket = await Tickets.findById(TicketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const newMessage = await Chats.create({
      TicketId,
      senderemail,
      receiveremail,
      file,
      fileName,
      message,
    });

    
    ticket.chats.push(newMessage._id);

    await ticket.save();

    return res.status(201).json({
      status: 201,
      message: "Message added to ticket.",
      chatId: newMessage._id,
    });
  } catch (error) {
    console.error("Error while adding message:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};





module.exports = {

  addMessage: [upload.single("file"), addMessage]
 
};
