const express = require("express");
const router = express.Router();

const {
  addMessage,

} = require("../Controller/chatController");

router.post("/add", addMessage);


module.exports = router;
