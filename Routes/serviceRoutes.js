const express = require("express");
const router = express.Router();

const {
  createservice,
  updateService,
  listserviceAdmin,
  getServiceById,
 
} = require("../Controller/serviceController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/create", createservice);
router.put("/update/:id", updateService);
router.get("/get/:id", getServiceById);
router.get("/listbyadmin", listserviceAdmin);
module.exports = router;
