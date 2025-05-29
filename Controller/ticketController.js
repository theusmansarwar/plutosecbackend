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
    const totalTickets = await Tickets.countDocuments();
    const generateTicket = await Tickets.create({
      ticketNO: totalTickets.toString().padStart(4, '0'),
      clientemail: LeadsData.email,
      clientname: LeadsData.name,
      receivername:"admin",
      receiveremail:"admin@plutosec.ca",
      subject:LeadsData.subject,
    });
    sendEmailToUser({ TicketId:generateTicket._id, clientemail: LeadsData.email,name:LeadsData.name, ticketNO:generateTicket.ticketNO}, res);

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

    const lead = await Tickets.findById(id).populate({
        path: "chats",
       
      });

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


module.exports = {
  CreateTicket,

  GetTicketById,
};
