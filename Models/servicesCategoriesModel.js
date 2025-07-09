const mongoose = require("mongoose");

const ServiceCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    published: { type: Boolean, default: false },
    thumbnail: { type: String, required: true },
  },
  { timestamps: true }
);

const ServiceCategory = mongoose.model(
  "ServiceCategory",
  ServiceCategorySchema
);
module.exports = ServiceCategory; 
