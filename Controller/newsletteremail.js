const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmailToUser = async ({ emails, blog }, res) => {
  const blogUrl = `https://plutosec.ca/blog/${blog.slug}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <div style="background-color: #0052cc; padding: 20px; color: white; text-align: center;">
          <h2>Thank You for Your Interest</h2>
        </div>
        <div style="padding: 20px; color: #333;">
          <p>Thank you for getting in touch with <strong>PlutoSec</strong>.</p>
          <p>While we prepare to assist you, here’s a blog post you might find helpful:</p>
          <h3 style="margin-top: 30px;">${blog.title}</h3>
          <img src="https://plutosec.ca/api/${blog.image}" alt="Blog Image" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 6px; margin: 15px 0;">
          <div style="text-align: center; margin-top: 20px;">
            <a href="${blogUrl}" target="_blank" style="background-color: #0052cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Blog</a>
          </div>
          <p style="margin-top: 30px;">We’ll be in touch soon.</p>
          <p>– The PlutoSec Team</p>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 13px; color: #777;">
          <p>&copy; 2025 PlutoSec. All rights reserved. | <a href="https://plutosec.ca" style="color: #0052cc;">Visit Website</a></p>
        </div>
      </div>
    </div>
  `;

  try {
    for (const email of emails) {
      await transporter.sendMail({
        from: `"PlutoSec" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Recommended Blog from PlutoSec`,
        html: htmlContent,
      });

      await new Promise((res) => setTimeout(res, 2000)); 
    }

    return true;
  } catch (error) {
    console.error("Error sending emails:", error);
    throw error;
  }
};
module.exports = sendEmailToUser;
