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
const listserviceAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 

    const servicelist = await Services.find()
      .select("-offerings -description -metaDescription -cta -successstories ")
      .sort({ createdAt: -1 })
     .populate("category", "name published thumbnail")
      .limit(limit)
      .skip((page - 1) * limit);

    const totalservices = await Services.countDocuments();

    res.status(200).json({
      totalservices,
      totalPages: Math.ceil(totalservices / limit),
      currentPage: page,
      limit: limit,
      servicelist: servicelist,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};


const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Services.findById(id)
      .populate("category", "name ")
      .populate("offerings", "name  published items")  
      .populate("successstories", "name published items")
      .exec();

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Service fetched successfully",
      service,
    });
  } catch (error) {
    console.error("Error fetching service by ID:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteAllservices = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid request. Provide ServiceCategory IDs." });
    }
 
   

    

    await Services.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      status: 200,
      message: "Categories Delete successfully.",
   
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  createservice,updateService,listserviceAdmin,getServiceById,deleteAllservices
};
