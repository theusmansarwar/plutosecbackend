const express = require("express");
const router = express.Router();

const {
  createservice,
 
} = require("../Controller/serviceController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/create", createservice);

module.exports = router;
