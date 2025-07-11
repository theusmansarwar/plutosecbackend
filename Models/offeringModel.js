const mongoose = require("mongoose");

const OfferingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    published: { type: Boolean, default: false },
    items: [{ type: String }]
  },
  { timestamps: true }
);

const Offering = mongoose.model("OfferingSchema", OfferingSchema);
module.exports = Offering;
