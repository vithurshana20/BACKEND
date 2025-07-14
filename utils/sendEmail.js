// import nodemailer from "nodemailer";

// export const sendEmail = async (to, subject, html) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail", // or "Outlook", "Yahoo"
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   await transporter.sendMail({
//     from: `"CourtEZ" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html,
//   });
// };
import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text }) => {
  // Use your real email and app password or environment variables
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,      // your email
      pass: process.env.EMAIL_PASS,      // your app password
    },
  });

  await transporter.sendMail({
    from: `"EZCO" <${process.env.EMAIL_USER}>`, // <-- This line sets the sender name to EZCO
    to,
    subject,
    text,
  });
};