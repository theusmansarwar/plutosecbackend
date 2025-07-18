const Blogs = require("../Models/blogModel");
const Comment = require("../Models/commentModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Category = require("../Models/categoryModel");
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

const createblog = async (req, res) => {
  try {
    const {
      title,
      description,
      detail,
      author,
     
      metaDescription,
      slug,
      category,
      published,
   
      faqSchema,
      featured,
    } = req.body;

    const thumbnail = req.file ? `/uploads/${req.file.filename}` : null;
    const missingFields = [];

    const isPublished = published === "true" || published === true;
    const isFeatured = featured === "true" || featured === true;
    if (isPublished) {
      if (!title)
        missingFields.push({ name: "title", message: "Title is required" });
      if (!description)
        missingFields.push({
          name: "description",
          message: "Description is required",
        });
      if (!detail)
        missingFields.push({ name: "detail", message: "Detail is required" });
      if (!author)
        missingFields.push({ name: "author", message: "Author is required" });
      if (!metaDescription)
        missingFields.push({
          name: "metaDescription",
          message: "Meta description is required",
        });
      if (!slug)
        missingFields.push({ name: "slug", message: "Slug is required" });
      if (!thumbnail)
        missingFields.push({
          name: "thumbnail",
          message: "Thumbnail (image) is required",
        });
      if (!category)
        missingFields.push({
          name: "category",
          message: "Category is required",
        });
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          status: 400,
          message: "Some fields are missing!",
          missingFields,
        });
      }

      const [existingTitle, existingSlug] = await Promise.all([
        Blogs.findOne({ title }),
        Blogs.findOne({ slug }),
      ]);
      if (existingTitle)
        return res.status(400).json({ message: "Blog Title already exists" });
      if (existingSlug)
        return res.status(400).json({ message: "Blog Slug already exists" });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists)
      return res.status(400).json({ message: "Invalid category ID" });

    const newBlog = await Blogs.create({
      title,
      description,
      detail,
      author,
      slug,
      thumbnail,
 
      metaDescription,
      published: isPublished,
      featured: isFeatured,

      category: { _id: categoryExists._id, name: categoryExists.name },
      faqSchema,
    });

    res.status(201).json({
      status: 201,
      message: "Blog created successfully",
      blog: newBlog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateblog = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      title,
      description,
      detail,
      author,
      slug,
   
      metaDescription,
      published,
      category,
 
      faqSchema,
      featured,
    } = req.body;

    const thumbnail = req.file ? `/uploads/${req.file.filename}` : null;
    const isPublished = published === "true" || published === true;
    const isFeatured = featured === "true" || featured === true;
    const blog = await Blogs.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists)
        return res.status(400).json({ message: "Invalid category ID" });
      blog.category = { _id: categoryExists._id, name: categoryExists.name };
    }

    blog.title = title || blog.title;
    blog.description = description || blog.description;
    blog.detail = detail || blog.detail;
    blog.author = author || blog.author;
    blog.slug = slug || blog.slug;
    blog.metaDescription = metaDescription || blog.metaDescription;
    blog.published = isPublished;
    blog.featured = isFeatured;

    blog.faqSchema = faqSchema;

    if (thumbnail) {
      if (blog.thumbnail) {
        const oldPath = path.join(__dirname, "..", blog.thumbnail);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      blog.thumbnail = thumbnail;
    }

    await blog.save();
    res
      .status(200)
      .json({ status: 200, message: "Blog updated successfully", blog });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteblog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blogs.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    await Comment.deleteMany({ blogId: id });
    if (blog.thumbnail) {
      const filePath = path.join(__dirname, "..", blog.thumbnail);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Blogs.findByIdAndDelete(id);

    res.status(200).json({ status: 200, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const deletemultiblog = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting an array of blog IDs

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or empty list of blog IDs" });
    }

    // ✅ Find all blogs by IDs
    const blogs = await Blogs.find({ _id: { $in: ids } });

    if (blogs.length === 0) {
      return res
        .status(404)
        .json({ message: "No blogs found with the given IDs" });
    }
    await Comment.deleteMany({ blogId: { $in: ids } });
    // ✅ Delete each blog's thumbnail if exists
    blogs.forEach((blog) => {
      if (blog.thumbnail) {
        const filePath = path.join(__dirname, "..", blog.thumbnail);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // Delete the image file
        }
      }
    });

    // ✅ Delete blogs in one go
    await Blogs.deleteMany({ _id: { $in: ids } });

    res
      .status(200)
      .json({ status: 200, message: "Blogs deleted successfully" });
  } catch (error) {
    console.error("Error deleting blogs:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const listblog = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get page from query, default to 1
    const limit = parseInt(req.query.limit) || 10; // Get limit from query, default to 10

    const blogslist = await Blogs.find({ published: true })
      .select("-comments -detail -published -viewedBy")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalBlogs = await Blogs.countDocuments({ published: true });

    res.status(200).json({
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / limit),
      currentPage: page,
      limit: limit,
      blogs: blogslist,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const getFeaturedblogs = async (req, res) => {
  try {
    const allFeaturedBlogs = await Blogs.find({
      published: true,
      featured: true,
    }).select("-comments -detail -published -viewedBy -featured");

    // Step 2: Randomly shuffle and pick 4
    const shuffled = allFeaturedBlogs.sort(() => 0.5 - Math.random());
    const blogslist = shuffled.slice(0, 4);

    res.status(200).json({
      blogs: blogslist,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const getFeaturedblogsadmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get page from query, default to 1
    const limit = parseInt(req.query.limit) || 10;
    const allFeaturedBlogs = await Blogs.find({
    
      featured: true,
    })
      .select("-comments -detail -viewedBy -featured")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    const totalBlogs = await Blogs.countDocuments({
     
      featured: true,
    });
    res.status(200).json({
      blogs: allFeaturedBlogs,
      currentPage: page,
      limit: limit,
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / limit),
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const listblogAdmin = async (req, res) => {
  try {
    const { title } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let filter = {};
    function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

if (title) {
  const escapedTitle = escapeRegex(title);
  filter.title = { $regex: escapedTitle, $options: "i" };
}


    const blogslist = await Blogs.find(filter)
    .select("-comments -detail -viewedBy -metaDescription -description -thumbnail -faqSchema -slug")
      .sort({ createdAt: -1 })
      .populate({
        path: "category",
        model: "Category",
      })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalBlogs = await Blogs.countDocuments(filter);

    

    return res.status(200).json({
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / limit),
      currentPage: page,
      limit: limit,
      blogs: blogslist,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const listblogWritter = async (req, res) => {
  try {
    const { title, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Author is required
    if (!search) {
      return res.status(400).json({ message: "Author (search) is required." });
    }

    // Escape regex
    const escapeRegex = (text) =>
      text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    const escapedAuthor = escapeRegex(search);
    const filter = {
      author: { $regex: escapedAuthor, $options: "i" },
    };

    if (title) {
      const escapedTitle = escapeRegex(title);
      filter.title = { $regex: escapedTitle, $options: "i" };
    }

    const blogslist = await Blogs.find(filter)
      .select(
        "-comments -detail -viewedBy -metaDescription -description -thumbnail -faqSchema -slug"
      )
      .sort({ createdAt: -1 })
      .populate({
        path: "category",
        model: "Category",
      })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalBlogs = await Blogs.countDocuments(filter);

   

    res.status(200).json({
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / limit),
      currentPage: page,
      limit,
      blogs: blogslist,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};


const viewblog = async (req, res) => {
  try {
    const { slug } = req.params;
    let blog = await Blogs.findOne({ slug, published: true })
      .populate({
        path: "comments",
        match: { published: true },
        options: { sort: { createdAt: -1 } },
      })
      .populate("category");
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    blog = await Blogs.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate({
        path: "comments",
        match: { published: true },
        options: { sort: { createdAt: -1 } },
      })
      .populate("category");
    const commentsCount = blog.comments.length || 0;
    return res.status(200).json({
      message: "Blog fetched successfully",
      blog,
      commentsCount,
    });
  } catch (error) {
    console.error("Error viewing blog:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};


const viewblogbyid = async (req, res) => {
  try {
    const { id } = req.params;
    let blog = await Blogs.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    const commentsCount = blog.comments ? blog.comments.length : 0;
    return res.status(200).json({
      message: "Blog fetched successfully",
      blog,
      status: 200,
      commentsCount,
    });
  } catch (error) {
    console.error("Error viewing blog:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const getblogSlugs = async (req, res) => {
  try {
    const blogslist = await Blogs.find({ published: true })
      .select("slug _id title")
      .sort({ publishedDate: -1 });

    const totalBlogs = await Blogs.countDocuments({ published: true });

    res.status(200).json({
      totalBlogs,
      slugs: blogslist,
    });
  } catch (error) {
    console.error("Error fetching blog slugs:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};


const changeblogauther = async (req, res) => {
  try {
    const result = await Blogs.updateMany({}, { $set: { author: "Admin" } });

    res.status(200).json({
      status: 200,
      message: `${result.modifiedCount} blog authors updated to 'Admin'.`,
    });
  } catch (error) {
    console.error("Error updating blog authors:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
module.exports = {
  createblog: [upload.single("thumbnail"), createblog],
  updateblog: [upload.single("thumbnail"), updateblog],
  deleteblog,
  listblog,
  viewblog,
  deletemultiblog,
  listblogAdmin,
  listblogWritter,
  viewblogbyid,
  getblogSlugs,
  getFeaturedblogs,
  getFeaturedblogsadmin,
  changeblogauther,
  
};
