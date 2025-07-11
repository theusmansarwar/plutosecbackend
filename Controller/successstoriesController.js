const SuccessStories = require("../Models/successstoriesModel");
const Services = require("../Models/serviceModel");

const addSuccessStories = async (req, res) => {
  try {
    let { name, published, items, serviceid } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Success story name is required" });
    }
    if (!serviceid) {
      return res.status(400).json({ message: "Service ID is required" });
    }

    name = name.trim();
    const existingSuccessStories = await SuccessStories.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existingSuccessStories) {
      return res.status(400).json({ message: "SuccessStories already exists" });
    }

    if (!Array.isArray(items)) {
      items = [];
    }

    const newSuccessStories = new SuccessStories({
      name,
      published: published === true || published === "true",
      items,
    });

    const SuccessStoriesSaved = await newSuccessStories.save();

    // ✅ Add to corresponding Service
    const updatedService = await Services.findByIdAndUpdate(
      serviceid,
      { $push: { successstories: SuccessStoriesSaved._id } },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found to link offering" });
    }

    res.status(201).json({
      status: 201,
      message: "SuccessStoriesSaved added and linked to service successfully",
      SuccessStoriesSaved: SuccessStoriesSaved,
      linkedService: updatedService._id,
    });
  } catch (error) {
    console.error("Error adding offering:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateSuccessStories = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, published, items } = req.body;

    if (!name) {
      return res.status(400).json({ message: "SuccessStory name is required" });
    }

    name = name.trim();

    const existing = await SuccessStories.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existing && existing._id.toString() !== id) {
      return res.status(400).json({ message: "SuccessStory name already exists" });
    }

 
    if (!Array.isArray(items)) {
      items = [];
    }

    const updatedStory = await SuccessStories.findByIdAndUpdate(
      id,
      { name, published: published === true || published === "true", items },
      { new: true, runValidators: true }
    );

    if (!updatedStory) {
      return res.status(404).json({ message: "SuccessStory not found" });
    }

    res.status(200).json({
      status: 200,
      message: "SuccessStory updated successfully",
      successStory: updatedStory,
    });
  } catch (error) {
    console.error("Error updating success story:", error);
    res.status(500).json({ error: error.message });
  }
};


// ✅ Delete SuccessStories (Show List of Related Blogs)
const deleteSuccessStories = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStory = await SuccessStories.findByIdAndDelete(id);
    if (!deletedStory) {
      return res.status(404).json({ message: "SuccessStory not found" });
    }

    res.status(200).json({
      status: 200,
      message: "SuccessStory deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};const deleteAllSuccessStories = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request. Provide SuccessStory IDs." });
    }

    const result = await SuccessStories.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      status: 200,
      message: "SuccessStories deleted successfully",
      deletedCount: result.deletedCount,
      deletedIds: ids,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }};

  
 const getSuccessStoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const successStory = await SuccessStories.findById(id);

    if (!successStory) {
      return res.status(404).json({ message: "SuccessStory not found" });
    }

    res.status(200).json({
      status: 200,
      message: "SuccessStory retrieved successfully",
      successStory,
    });
  } catch (error) {
    console.error("Error fetching success story:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addSuccessStories, updateSuccessStories, deleteSuccessStories,deleteAllSuccessStories, getSuccessStoryById };
