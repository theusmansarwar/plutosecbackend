const mongoose = require("mongoose");

const successstoriesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    published: { type: Boolean, default: false },
    items: [{ type: String }]
  },
  { timestamps: true }
);

const SuccessStories = mongoose.model("successstoriesSchema", successstoriesSchema);
module.exports = SuccessStories;
