const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com", // GoDaddy SMTP server
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmailToCompany = ({ email, name,lastname, subject, phone, query }, res) => {
  // ✅ 1. Email to the Customer
  const customerMailOptions = {
    from: `"PlutoSec" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Thank You for Reaching Out – Pluto IT Solutions Inc`,
    html: `
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table cellpadding="0" cellspacing="0" border="0" 
          style="width: 100%; background-color: #f4f4f4; padding: 20px; text-align: center;">
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" border="0" 
                style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; 
                overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #0052cc; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Thank You for Contacting PlutoSec</h1>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 20px; text-align: left; color: #333333;">
                    <p style="margin: 0; font-size: 16px;">Dear ${name} ${lastname},</p>
                    <p style="margin: 16px 0; font-size: 16px;">
                      Thank you for reaching out to <strong>PlutoSec</strong>. We have received your query and our team will get back to you shortly.
                    </p>
                  
                    <p style="margin: 16px 0; font-size: 16px;">We appreciate your patience and look forward to assisting you.</p>
                    <p style="margin: 16px 0; font-size: 16px;">Best regards,</p>
                    <p style="margin: 0; font-size: 16px; font-weight: bold;">PlutoSec Team</p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 14px; color: #777777;">
                    <p style="margin: 0;">&copy; 2025 PlutoSec. All rights reserved.</p>
                    <p style="margin: 0;">Visit us: <a href="https://plutosec.ca" style="color: #0052cc; text-decoration: none;">plutosec.ca</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    `,
  };

  // ✅ 2. Email to the Admin
const adminMailOptions = {
  from: `"PlutoSec" <${process.env.EMAIL_USER}>`,
  to: process.env.ADMIN_EMAIL,
  subject: `New Lead from ${name} ${lastname}`,
  html: `
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table cellpadding="0" cellspacing="0" border="0" 
        style="width: 100%; background-color: #f4f4f4; padding: 20px; text-align: center;">
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0" border="0" 
              style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; 
              overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #d9534f; padding: 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Lead Received</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 20px; text-align: left; color: #333333;">
                  <p style="margin: 0; font-size: 16px;"><strong>Name:</strong> ${name}</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Email:</strong> ${email}</p>

                  <!-- Compose Email Button -->
                  <p style="margin: 10px 0;">
                    <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" 
                      style="display: inline-block; background-color: #007bff; color: #ffffff; 
                      padding: 10px 20px; text-decoration: none; border-radius: 4px; 
                      font-size: 14px;">
                      Compose Email
                    </a>
                  </p>

                  <p style="margin: 0; font-size: 16px;"><strong>Phone:</strong> ${phone}</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Subject:</strong> ${subject}</p>
                  <p style="margin: 16px 0; font-size: 16px;"><strong>Query:</strong></p>
                  <p style="margin: 0; font-size: 16px;">${query}</p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 14px; color: #777777;">
                  <p style="margin: 0;">This is an automated email. Please do not reply.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  `
};


  // Send Emails
  transporter.sendMail(customerMailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email to customer:", error);
      return res.status(500).json({ status: 500, message: "Error sending email to customer" });
    }

    transporter.sendMail(adminMailOptions, (adminError, adminInfo) => {
      if (adminError) {
        console.error("Error sending email to admin:", adminError);
        return res.status(500).json({ status: 500, message: "Error sending email to admin" });
      }

      return res.status(200).json({ status: 200, message: "Emails sent successfully" });
    });
  });
};
const sendEmailToUser = ({ TicketId, clientemail, name, ticketNO }, res) => {
  const ticketLink = `https://crm.plutosec.ca/ticket/${TicketId}`;

  const customerMailOptions = {
    from: `"PlutoSec" <${process.env.EMAIL_USER}>`,
    to: clientemail,
    subject: `#${ticketNO} New Ticket Created – PlutoSec Support`,
    html: `
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table cellpadding="0" cellspacing="0" border="0" 
          style="width: 100%; background-color: #f4f4f4; padding: 20px; text-align: center;">
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" border="0" 
                style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; 
                overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #0052cc; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Your Support Ticket is Created</h1>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 20px; text-align: left; color: #333333;">
                    <p style="margin: 0; font-size: 16px;">Dear ${name},</p>
                    <p style="margin: 16px 0; font-size: 16px;">
                      A new support ticket has been created for your request. You can view and track its progress using the link below:
                    </p>
                    <p style="margin: 16px 0;">
                      <a href="${ticketLink}" style="background-color: #0052cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                        View Ticket
                      </a>
                    </p>
                    <p style="margin: 16px 0; font-size: 16px;">Thank you for contacting PlutoSec. We’ll get back to you shortly.</p>
                    <p style="margin: 16px 0; font-size: 16px;">Best regards,<br><strong>PlutoSec Team</strong></p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 14px; color: #777777;">
                    <p style="margin: 0;">&copy; 2025 PlutoSec. All rights reserved.</p>
                    <p style="margin: 0;">Visit us: <a href="https://plutosec.ca" style="color: #0052cc; text-decoration: none;">plutosec.ca</a></p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    `,
  };

  // Send Email to User
  transporter.sendMail(customerMailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email to user:", error);
      return res.status(500).json({ status: 500, message: "Error sending email to user" });
    }

    return res.status(200).json({ status: 200, message: "Email sent successfully to user" });
  });
};
const sendNewMessageEmailToReceiver = ({ TicketId, receiveremail, receivername }, res) => {
  const ticketLink = `https://crm.plutosec.ca/ticket/${TicketId}`;
  const ticketLink2 = `https://crm.plutosec.ca/ticketviewbyadmin/${TicketId}`;

  const finalTicketLink = receiveremail === "theusmansarwar26@gmail.com" ? ticketLink2 : ticketLink;

  const customerMailOptions = {
    from: `"PlutoSec" <${process.env.EMAIL_USER}>`,
    to: receiveremail,
    subject: `New Message on Your Support Ticket`,
    html: `
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table cellpadding="0" cellspacing="0" border="0" 
          style="width: 100%; background-color: #f4f4f4; padding: 20px; text-align: center;">
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" border="0" 
                style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; 
                overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #0052cc; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Message on Your Support Ticket</h1>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 20px; text-align: left; color: #333333;">
                    <p style="margin: 0; font-size: 16px;">Dear ${receivername || "Customer"},</p>
                    <p style="margin: 16px 0; font-size: 16px;">
                      A new message has been added to your support ticket. You can view and reply to the message by clicking the button below:
                    </p>
                    <p style="margin: 16px 0;">
                      <a href="${finalTicketLink}" style="background-color: #0052cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                        View Ticket
                      </a>
                    </p>
                    <p style="margin: 16px 0; font-size: 16px;">If you have further questions, feel free to respond directly through the ticket portal.</p>
                    <p style="margin: 16px 0; font-size: 16px;">Best regards,<br><strong>PlutoSec Support Team</strong></p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 14px; color: #777777;">
                    <p style="margin: 0;">&copy; 2025 PlutoSec. All rights reserved.</p>
                    <p style="margin: 0;">Visit us: <a href="https://plutosec.ca" style="color: #0052cc; text-decoration: none;">plutosec.ca</a></p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    `,
  };

  transporter.sendMail(customerMailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email to user:", error);
      return res.status(500).json({ status: 500, message: "Error sending email to user" });
    }

    return res.status(200).json({ status: 200, message: "Email sent successfully to user" });
  });
};



module.exports = {sendEmailToCompany,sendEmailToUser,sendNewMessageEmailToReceiver};
