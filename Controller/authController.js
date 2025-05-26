const User = require("../Models/adminModel");
const bcrypt = require("bcryptjs");
const Comment = require("../Models/commentModel");
const Blogs = require("../Models/blogModel");
const Leads = require("../Models/leadsModel");
const { View, TotalImpression } = require("../Models/viewModel");
const Application = require("../Models/applicationModel");

const register = async (req, res) => {
  const { name, email, password } = req.body;

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

  try {
    const emailAvailable = await User.findOne({ email });

    if (emailAvailable) {
      return res.status(400).json({
        status: 400,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 4);

    const user = await User.create({
      name,
      email,

      password: hashedPassword,
    });
    const type = "Registion process";

    res.status(201).json({
      status: 201,
      message: "User registered successfully",
      data: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
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
      res.status(200).json({
        status: 200,
        message: "LoggedIn Successfully",
        data: user,
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
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    const yesterdayLeads = await Leads.countDocuments({
      createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd }
    });

    const todayApplications = await Application.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    const yesterdayApplications = await Application.countDocuments({
      createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd }
    });

    const todayImpressionData = await View.findOne({
      date: { $gte: todayStart, $lte: todayEnd }
    });

    const yesterdayImpressionData = await View.findOne({
      date: { $gte: yesterdayStart, $lte: yesterdayEnd }
    });

    // ✅ Set default values
    const todayImpression = todayImpressionData ? todayImpressionData.views : 0;
    const yesterdayImpression = yesterdayImpressionData ? yesterdayImpressionData.views : 0;

    // ✅ Fetch total impressions count
    const totalImpressionRecord = await TotalImpression.findOne().select("totalImpression -_id");
    const totalImpressions = totalImpressionRecord ? totalImpressionRecord.totalImpression : 0;

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



module.exports = {
  register,
  stats,
  login,
};
