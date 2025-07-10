const ServiceCategory = require("../Models/servicesCategoriesModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // ✅ Required for blog-ServiceCategory relation
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Multer Upload Middleware
const upload = multer({ storage: storage, fileFilter: fileFilter });
const addServiceCategory = async (req, res) => {
  try {
    let { name, published } = req.body;
    const thumbnail = req.file ? `/uploads/${req.file.filename}` : null;
    if (!name) {
      return res
        .status(400)
        .json({ message: "ServiceCategory name is required" });
    }

    name = name.trim(); // ✅ Trim whitespace
    const existingServiceCategory = await ServiceCategory.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });

    if (existingServiceCategory) {
      return res
        .status(400)
        .json({ message: "ServiceCategory already exists" });
    }

    const Service_Category = new ServiceCategory({ name, published, thumbnail });
    await Service_Category.save();

    res
      .status(201)
      .json({
        status: 201,
        message: "ServiceCategory added successfully",
        ServiceCategory,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update ServiceCategory
const updateServiceCategory = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, published } = req.body;
    const category = await ServiceCategory.findById(id);

    if (!category) {
      return res.status(404).json({ message: "ServiceCategory not found" });
    }

    if (!name) {
      return res.status(400).json({ message: "ServiceCategory name is required" });
    }

    name = name.trim();

    const existing = await ServiceCategory.findOne({
      name: new RegExp(`^${name}$`, "i"),
      _id: { $ne: id },
    });

    if (existing) {
      return res.status(400).json({ message: "ServiceCategory name already exists" });
    }

    // Handle new thumbnail
    if (req.file) {
      const newThumbnail = `/uploads/${req.file.filename}`;
      if (category.thumbnail) {
        const oldPath = path.join(__dirname, "..", category.thumbnail);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      category.thumbnail = newThumbnail;
    }

    category.name = name;
    category.published = published;
    await category.save();

    res.status(200).json({
      status: 200,
      message: "ServiceCategory updated successfully",
      ServiceCategory: category,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete ServiceCategory (Show List of Related ServiceCategory)
const deleteServiceCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Find all ServiceCategory linked to this ServiceCategory
    const existingServiceCategory = await ServiceCategory.find({ ServiceCategory: id }).select(
      "title _id slug"
    );

    if (existingServiceCategory.length > 0) {
      return res.status(400).json({
        message: "Cannot delete ServiceCategory. It is linked to ServiceCategory.",
        ServiceCategory: existingServiceCategory, // ✅ Return list of linked ServiceCategory (ID + Title)
      });
    }

    const ServiceCategory = await ServiceCategory.findByIdAndDelete(id);
    if (!ServiceCategory)
      return res.status(404).json({ message: "ServiceCategory not found" });

    res.status(200).json({ message: "ServiceCategory deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const deleteAllCategories = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid request. Provide ServiceCategory IDs." });
    }
    const linkedServiceCategory = await ServiceCategory.find({
      ServiceCategory: { $in: ids },
    }).select("title _id ServiceCategory");
    const categoriesWithServiceCategory = [
      ...new Set(linkedServiceCategory.map((blog) => blog.ServiceCategory.toString())),
    ];
    const categoriesToDelete = ids.filter(
      (id) => !categoriesWithServiceCategory.includes(id)
    );

    if (categoriesToDelete.length === 0) {
      return res.status(400).json({
        message: "Cannot delete categories. All are linked to ServiceCategory.",
        linkedServiceCategory,
      });
    }

    await ServiceCategory.deleteMany({ _id: { $in: categoriesToDelete } });

    res.status(200).json({
      status: 200,
      message: "Categories Delete successfully.",
      deletedCategories: categoriesToDelete,
      failedToDelete: categoriesWithServiceCategory,
      linkedServiceCategory,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const viewServiceCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default page = 1
    const limit = parseInt(req.query.limit) || 10; // Default limit = 10

    const totalCategories = await ServiceCategory.countDocuments();
    const categories = await ServiceCategory.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json({
      totalCategories,
      totalPages: Math.ceil(totalCategories / limit),
      currentPage: page,
      limit: limit,
      categories: categories,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ View Only Published Categories with Pagination
const liveServiceCategory = async (req, res) => {
  try {
    const categories = await ServiceCategory.find({ published: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      totalCategories: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addServiceCategory: [upload.single("thumbnail"), addServiceCategory],
  updateServiceCategory: [upload.single("thumbnail"), updateServiceCategory],
  deleteServiceCategory,
  viewServiceCategory,
  liveServiceCategory,
  deleteAllCategories,
};
