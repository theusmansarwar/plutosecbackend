const express = require("express");
const router = express.Router();

const {
  addServiceCategory,
  deleteServiceCategory,
  updateServiceCategory,
  viewServiceCategory,
  liveServiceCategory,
  deleteAllCategories,
} = require("../Controller/ServiceCategoriesController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/add", authMiddleware, addServiceCategory);
router.put("/update/:id", authMiddleware, updateServiceCategory);
router.delete("/delete/:id", authMiddleware, deleteServiceCategory);
router.delete("/delete", authMiddleware, deleteAllCategories);
router.get("/view", authMiddleware, viewServiceCategory);
router.get("/live", liveServiceCategory);

module.exports = router;
