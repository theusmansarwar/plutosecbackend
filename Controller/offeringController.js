const Offerings = require("../Models/offeringModel");

const Services = require("../Models/serviceModel");

const addOfferings = async (req, res) => {
  try {
    let { name, published, items, serviceid } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Offerings name is required" });
    }
    if (!serviceid) {
      return res.status(400).json({ message: "Service ID is required" });
    }

    name = name.trim();
   

    if (!Array.isArray(items)) {
      items = [];
    }

    const newOfferings = new Offerings({
      name,
      published: published === true || published === "true",
      items,
    });

    const offeringsSaved = await newOfferings.save();

    const updatedService = await Services.findByIdAndUpdate(
      serviceid,
      { $push: { offerings: offeringsSaved._id } },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found to link offering" });
    }

    res.status(201).json({
      status: 201,
      message: "Offerings added and linked to service successfully",
      offerings: offeringsSaved,
      linkedService: updatedService._id,
    });
  } catch (error) {
    console.error("Error adding offering:", error);
    res.status(500).json({ error: error.message });
  }
};


const updateOfferings = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, published, items } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Offerings name is required" });
    }

    name = name.trim();

   
 
    if (!Array.isArray(items)) {
      items = [];
    }

    const updatedStory = await Offerings.findByIdAndUpdate(
      id,
      { name, published: published === true || published === "true", items },
      { new: true, runValidators: true }
    );

    if (!updatedStory) {
      return res.status(404).json({ message: "Offerings not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Offerings updated successfully",
      Offerings: updatedStory,
    });
  } catch (error) {
    console.error("Error updating success story:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteOfferings = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStory = await Offerings.findByIdAndDelete(id);
    if (!deletedStory) {
      return res.status(404).json({ message: "Offerings not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Offerings deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};const deleteAllOfferings = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request. Provide Offerings IDs." });
    }
    const result = await Offerings.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      status: 200,
      message: "Offerings deleted successfully",
      deletedCount: result.deletedCount,
      deletedIds: ids,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }};

  
 const getOfferingsById = async (req, res) => {
  try {
    const { id } = req.params;

    const Offerings = await Offerings.findById(id);

    if (!Offerings) {
      return res.status(404).json({ message: "Offerings not found" });
    }

    res.status(200).json({
      status: 200,
      message: "Offerings retrieved successfully",
      Offerings,
    });
  } catch (error) {
    console.error("Error fetching success story:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addOfferings, updateOfferings, deleteOfferings,deleteAllOfferings, getOfferingsById };
