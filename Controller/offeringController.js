const Offering = require("../Models/OfferingModel");


const addOffering = async (req, res) => {
  try {
    let { name, published, items } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Offering name is required" });
    }

    name = name.trim();
    const existingSuccessStory = await Offering.findOne({ name: new RegExp(`^${name}$`, "i") });

    if (existingSuccessStory) {
      return res.status(400).json({ message: "SuccessStory already exists" });
    }

    if (!Array.isArray(items)) {
      items = [];
    }

    const newSuccessStory = new Offering({
      name,
      published: published === true || published === "true", // handle boolean as string too
      items,
    });

    await newSuccessStory.save();

    res.status(201).json({
      status: 201,
      message: "SuccessStory added successfully",
      successStory: newSuccessStory,
    });
  } catch (error) {
    console.error("Error adding success story:", error);
    res.status(500).json({ error: error.message });
  }
};


const updateOffering = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, published, items } = req.body;

    if (!name) {
      return res.status(400).json({ message: "SuccessStory name is required" });
    }

    name = name.trim();

    const existing = await Offering.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existing && existing._id.toString() !== id) {
      return res.status(400).json({ message: "SuccessStory name already exists" });
    }

 
    if (!Array.isArray(items)) {
      items = [];
    }

    const updatedStory = await Offering.findByIdAndUpdate(
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


// ✅ Delete Offering (Show List of Related Blogs)
const deleteOffering = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStory = await Offering.findByIdAndDelete(id);
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
};const deleteAllOffering = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request. Provide SuccessStory IDs." });
    }

    const result = await Offering.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      status: 200,
      message: "Offering deleted successfully",
      deletedCount: result.deletedCount,
      deletedIds: ids,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }};

  
 const getSuccessStoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const successStory = await Offering.findById(id);

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

module.exports = { addOffering, updateOffering, deleteOffering,deleteAllOffering, getSuccessStoryById };
