const express = require("express");
const router = express.Router();

const {
  CreateTicket,
  GetTicketById
 
} = require("../Controller/ticketController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add",authMiddleware, CreateTicket);
router.get("/view/:id", GetTicketById);

module.exports = router;
