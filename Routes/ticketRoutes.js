const express = require("express");
const router = express.Router();

const {
  CreateTicket,
 
} = require("../Controller/ticketController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add",authMiddleware, CreateTicket);


module.exports = router;
