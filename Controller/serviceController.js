const Services = require("../Models/serviceModel");
const ServiceCategory = require("../Models/servicesCategoriesModel");

const createservice = async (req, res) => {
  try {
    const {
      title,
      description,
      cta,
      metaDescription,
      slug,
      category,
      published,
      successstories,
      offerings,
    } = req.body;

    const missingFields = [];
    const isPublished = published === "true" || published === true;
    if (isPublished) {
      if (!title) missingFields.push({ name: "title", message: "Title is required" });
      if (!description) missingFields.push({ name: "description", message: "Description is required" });
      if (!cta) missingFields.push({ name: "cta", message: "CTA is required" });
      if (!metaDescription) missingFields.push({ name: "metaDescription", message: "Meta description is required" });
      if (!slug) missingFields.push({ name: "slug", message: "Slug is required" });
      if (!category) missingFields.push({ name: "category", message: "Category is required" });

      if (missingFields.length > 0) {
        return res.status(400).json({
          status: 400,
          message: "Some fields are missing!",
          missingFields,
        });
      }
      const [existingTitle, existingSlug] = await Promise.all([
        Services.findOne({ title }),
        Services.findOne({ slug }),
      ]);
      if (existingTitle) return res.status(400).json({ message: "Service title already exists" });
      if (existingSlug) return res.status(400).json({ message: "Service slug already exists" });
    }

    // Check if category exists
    const categoryExists = await ServiceCategory.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const newService = await Services.create({
      title,
      description,
      cta,
      metaDescription,
      slug,
      published: isPublished,
      offerings,
      successstories,
      category: { _id: categoryExists._id },
    });

    res.status(201).json({
      status: 201,
      message: "Service created successfully",
      service: newService,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      cta,
      metaDescription,
      slug,
      category,
      published,
      offerings,
      successstories,
    } = req.body;

    const missingFields = [];
    const isPublished = published === "true" || published === true;

    if (isPublished) {
      if (!title) missingFields.push({ name: "title", message: "Title is required" });
      if (!description) missingFields.push({ name: "description", message: "Description is required" });
      if (!cta) missingFields.push({ name: "cta", message: "CTA is required" });
      if (!metaDescription) missingFields.push({ name: "metaDescription", message: "Meta description is required" });
      if (!slug) missingFields.push({ name: "slug", message: "Slug is required" });
      if (!category) missingFields.push({ name: "category", message: "Category is required" });

      if (missingFields.length > 0) {
        return res.status(400).json({
          status: 400,
          message: "Some fields are missing!",
          missingFields,
        });
      }

      // Check for existing title/slug (excluding current service)
      const [existingTitle, existingSlug] = await Promise.all([
        Services.findOne({ title, _id: { $ne: id } }),
        Services.findOne({ slug, _id: { $ne: id } }),
      ]);
      if (existingTitle) return res.status(400).json({ message: "Service title already exists" });
      if (existingSlug) return res.status(400).json({ message: "Service slug already exists" });
    }

    // Check if category exists
    const categoryExists = await ServiceCategory.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const updatedService = await Services.findByIdAndUpdate(
      id,
      {
        title,
        description,
        cta,
        metaDescription,
        slug,
        published: isPublished,
        offerings,
        successstories,
        category: { _id: categoryExists._id },
      },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
module.exports = {
  createservice,updateService
};
