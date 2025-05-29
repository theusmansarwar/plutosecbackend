const Leads = require("../Models/leadsModel");
const Tickets = require("../Models/ticketModel");
const {sendEmailToUser} = require("./emailverification");
const axios = require("axios");

const CreateTicket = async (req, res) => {
  const { id } = req.body;
  const missingFields = [];
  if (!id) {
    missingFields.push({ name: "LeadsId", message: "Leads Id is required" });
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: 400,
      message: "Some fields are missing!",
      missingFields,
    });
  }

  try {
    const LeadsData = await Leads.findById(id);
    const generateTicket = await Tickets.create({
      clientemail: LeadsData.email,
      clientname: LeadsData.name,
      receivername:"admin",
      receiveremail:"admin@plutosec.ca",
      subject:LeadsData.subject,
    });
    sendEmailToUser({ TicketId:generateTicket._id, clientemail: LeadsData.email,name:LeadsData.name}, res);

    return res.status(201).json({
      status: 201,
      message: "Request Sent Successfully",
      generateTicket,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

const GetTicketById = async (req, res) => {
  try {
    const { id } = req.params; 

    const lead = await Tickets.findById(id);

    if (!lead) {
      return res.status(404).json({
        status: 404,
        message: "Ticket not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Ticket fetched successfully",
      lead,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};
const LeadsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalLeads = await Leads.countDocuments();

    const leads = await Leads.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    return res.status(200).json({
      status: 200,
      message: "Leads fetched successfully",
      leads: leads,
      totalLeads,
      totalPages: Math.ceil(totalLeads / limit),
      currentPage: page,
      limit: limit,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

const DeleteLeads = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid request. Provide Lead IDs." });
    }

    // ✅ Check if leads exist before deleting
    const existingLeads = await Leads.find({ _id: { $in: ids } });

    if (existingLeads.length === 0) {
      return res
        .status(404)
        .json({ status: 400, message: "No leads found with the given IDs." });
    }

    // ✅ Delete leads
    await Leads.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      status: 200,
      message: "Leads deleted successfully.",
      deletedLeads: ids,
    });
  } catch (error) {
    console.error("Error deleting leads:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  CreateTicket,
  LeadsList,
  GetTicketById,
  DeleteLeads,
};
