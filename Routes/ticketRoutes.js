const express = require("express");
const {
  CreateTicket,
  GetTicketById,
  listtickets
} = require("../Controller/ticketController");
const authMiddleware = require("../Middleware/authMiddleware");

module.exports = (io) => {
  const router = express.Router();

  // Attach Socket.IO to every request on this router
  // router.use((req, res, next) => {
  //   req.io = io;
  //   next();
  // });

  router.post("/add", authMiddleware, CreateTicket);
  router.get("/view/:id", GetTicketById);
  router.get("/list", listtickets);

  return router;
};
