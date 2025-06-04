const Leads = require("../Models/leadsModel");
const Tickets = require("../Models/ticketModel");
const { sendEmailToUser } = require("./emailverification");
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
    const totalTickets = await Tickets.countDocuments();
    const generateTicket = await Tickets.create({
      ticketNO: totalTickets.toString().padStart(4, "0"),
      clientemail: LeadsData.email,
      clientname: LeadsData.name,
      receivername: "PlutoSec Support Team",
      receiveremail: "contact@plutosec.ca",
      subject: LeadsData.subject,
      status: false,
    });
    sendEmailToUser(
      {
        TicketId: generateTicket._id,
        clientemail: LeadsData.email,
        name: LeadsData.name,
        ticketNO: generateTicket.ticketNO,
      },
      res
    );

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

    const ticket = await Tickets.findById(id).populate({
      path: "chats",
    });

    if (!ticket) {
      return res.status(404).json({
        status: 404,
        message: "Ticket not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Ticket fetched successfully",
      ticket,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};
const listtickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const ticketslist = await Tickets.find()
      .select("-chats")
      .sort({ status: 1, updatedAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalTickets = await Tickets.countDocuments();

    res.status(200).json({
      totalTickets,
      totalPages: Math.ceil(totalTickets / limit),
      currentPage: page,
      limit:limit,
      ticketslist,
    });
  } catch (error) {
    console.error("Error fetching Tickets:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  CreateTicket,

  GetTicketById,
  listtickets,
};
