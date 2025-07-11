const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String },
category: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCategory" },

    description: { type: String },
    metaDescription: { type: String, maxlength: 160, trim: true },
    slug: { type: String },
    cta: { type: String },
    offerings: [{ type: mongoose.Schema.Types.ObjectId, ref: "OfferingSchema" }],
    successstories: [{ type: mongoose.Schema.Types.ObjectId, ref: "successstoriesSchema" }],
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Services = mongoose.model("Services", ServiceSchema);
module.exports = Services;
