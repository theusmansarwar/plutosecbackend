const express = require("express");
const router = express.Router();

const {
  CreateTicket,
  GetTicketById,
  listtickets
 
} = require("../Controller/ticketController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add",authMiddleware, CreateTicket);
router.get("/view/:id", GetTicketById);
router.get("/list", listtickets);

module.exports = router;
