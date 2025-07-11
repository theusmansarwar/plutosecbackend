const express = require("express");
const router = express.Router();

const {
  createservice,
  updateService,
  listserviceAdmin,
 
} = require("../Controller/serviceController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/create", createservice);
router.post("/update/:id", updateService);
router.get("/listbyadmin", listserviceAdmin);
module.exports = router;
