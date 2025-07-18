const express = require("express");
const router = express.Router();

const {
  addSuccessStories,
  updateSuccessStories,
  deleteSuccessStories,
  deleteAllSuccessStories,
  getSuccessStoryById,
} = require("../Controller/successstoriesController");

const authMiddleware = require("../Middleware/authMiddleware");
router.post("/add", addSuccessStories);
router.put("/update/:id", authMiddleware, updateSuccessStories);
router.delete("delete/:id", authMiddleware, deleteSuccessStories);
router.delete("/delete-many", authMiddleware, deleteAllSuccessStories);
router.get("/:id", authMiddleware, getSuccessStoryById);



module.exports = router;
