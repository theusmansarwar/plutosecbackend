const express = require("express");
const router = express.Router();

const {
  addOffering,
  updateOffering,
  deleteOffering,
  deleteAllOffering,
  getSuccessStoryById,
} = require("../Controller/offeringController");

const authMiddleware = require("../Middleware/authMiddleware");
router.post("/add", authMiddleware, addOffering);
router.put("/update/:id", authMiddleware, updateOffering);
router.delete("delete/:id", authMiddleware, deleteOffering);
router.post("/delete-many", authMiddleware, deleteAllOffering);
router.get("/:id", authMiddleware, getSuccessStoryById);



module.exports = router;
