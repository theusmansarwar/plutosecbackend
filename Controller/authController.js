const User = require("../Models/adminModel");
const bcrypt = require("bcryptjs");
const Comment = require("../Models/commentModel");
const Blogs = require("../Models/blogModel");
const Leads = require("../Models/leadsModel");
const { View, TotalImpression } = require("../Models/viewModel");
const Application = require("../Models/applicationModel");
const UserType = require("../Models/typeModel");

const register = async (req, res) => {
  const { name, email, password, typeId } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({
      status: 400,
      message: "Email field must contain @",
    });
  }
  if (!name) {
    return res.status(400).json({
      status: 400,
      message: "Name field is required",
    });
  }
  if (!password) {
    return res.status(400).json({
      status: 400,
      message: "Password field is required",
    });
  }
  if (!typeId) {
    return res.status(400).json({
      status: 400,
      message: "TypeId is required",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 400,
        message: "Email already exists",
      });
    }

    const userType = await UserType.findById(typeId);
    if (!userType) {
      return res.status(400).json({
        status: 400,
        message: "Invalid user type",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 4);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      type: {
        _id: userType._id,
        name: userType.name,
      },
    });

    res.status(201).json({
      status: 201,
      message: "User registered successfully",
      data: {
        name: user.name,
        email: user.email,
        type: user.type,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({
      status: 400,
      message: "Email field must contain @",
    });
  }
  if (!password) {
    return res.status(400).json({
      status: 400,
      message: "Password field is required",
    });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      message: "Email not found",
    });
  } else {
    const matchPassword = await bcrypt.compare(password, user.password);
    if (matchPassword) {
      const { password: _, ...userWithoutPassword } = user.toObject();
      res.status(200).json({
        status: 200,
        message: "LoggedIn Successfully",
        data: userWithoutPassword,
        token: await user.generateToken(),
      });
    } else {
      res.status(400).json({
        message: "Invalid credientials",
      });
    }
  }
};

const stats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // ✅ Counts
    const totalBlogs = await Blogs.countDocuments();
    const totalLeads = await Leads.countDocuments();
    const totalApplications = await Application.countDocuments();

    // ✅ Leads
    const todayLeads = await Leads.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    const yesterdayLeads = await Leads.countDocuments({
      createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
    });

    const todayApplications = await Application.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    const yesterdayApplications = await Application.countDocuments({
      createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
    });

    const todayImpressionData = await View.findOne({
      date: { $gte: todayStart, $lte: todayEnd },
    });

    const yesterdayImpressionData = await View.findOne({
      date: { $gte: yesterdayStart, $lte: yesterdayEnd },
    });

    // ✅ Set default values
    const todayImpression = todayImpressionData ? todayImpressionData.views : 0;
    const yesterdayImpression = yesterdayImpressionData
      ? yesterdayImpressionData.views
      : 0;

    // ✅ Fetch total impressions count
    const totalImpressionRecord = await TotalImpression.findOne().select(
      "totalImpression -_id"
    );
    const totalImpressions = totalImpressionRecord
      ? totalImpressionRecord.totalImpression
      : 0;

    const totalComments = await Comment.countDocuments();

    return res.status(200).json({
      message: "Data fetched successfully",
      totalBlogs,
      totalApplications,
      todayApplications,
      yesterdayApplications,
      totalLeads,
      todayLeads,
      yesterdayLeads,
      todayImpression,
      yesterdayImpression,
      totalImpressions,
      totalComments,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching data", error });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10;

    const totalUsers = await User.countDocuments(); // ✅ count all users

    const users = await User.find()
      .select("-password") // ✅ exclude password
      .sort({ createdAt: -1 }) // ✅ latest first
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json({
      status: 200,
      data: users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      limit: limit,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to fetch users", error });
  }
};


// ✅ Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    res.status(200).json({ status: 200, data: user });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to fetch user", error });
  }
};

// ✅ Update user by ID
const updateUser = async (req, res) => {
  try {
    const { name, email, typeId } = req.body;

    const updateData = { name, email };
    if (typeId) {
      const userType = await UserType.findById(typeId);
      if (!userType) {
        return res.status(400).json({ status: 400, message: "Invalid user type" });
      }
      updateData.type = {
        _id: userType._id,
        name: userType.name,
      };
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    res.status(200).json({ status: 200, message: "User updated", data: user });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to update user", error });
  }
};

// ✅ Delete user by ID
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    res.status(200).json({ status: 200, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to delete user", error });
  }
};

// ✅ Multi delete users
const deleteMultipleUsers = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting: { ids: ["id1", "id2", ...] }
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ status: 400, message: "No user IDs provided" });
    }

    const result = await User.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ status: 200, message: `${result.deletedCount} user(s) deleted` });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to delete users", error });
  }
};
module.exports = {
  register,
  stats,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  deleteMultipleUsers

};
