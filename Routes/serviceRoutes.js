const express = require("express");
const router = express.Router();

const {
  createservice,
  updateService,
  listserviceAdmin,
  getServiceById,
  deleteAllservices,
  getServiceBySlug,
  getservicesSlugs
 
} = require("../Controller/serviceController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/create", createservice);
router.put("/update/:id", updateService);
router.get("/get/:id", getServiceById);
router.get("/listbyadmin", listserviceAdmin);
router.delete("/delete-many", deleteAllservices);
router.get('/view/:slug', getServiceBySlug);
router.get('/slugs', getservicesSlugs);
module.exports = router;
