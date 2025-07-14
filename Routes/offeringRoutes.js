const express = require("express");
const router = express.Router();

const {
  addOfferings,
  updateOfferings,
  deleteOfferings,
  deleteAllOfferings,
  getOfferingsById,
} = require("../Controller/offeringController");

const authMiddleware = require("../Middleware/authMiddleware");
router.post("/add", authMiddleware, addOfferings);
router.put("/update/:id", authMiddleware, updateOfferings);
router.delete("delete/:id", authMiddleware, deleteOfferings);
router.delete("/delete-many", authMiddleware, deleteAllOfferings);
router.get("/:id", authMiddleware, getOfferingsById);



module.exports = router;
