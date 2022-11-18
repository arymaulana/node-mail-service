const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const cors = require("cors");
const _ = require("lodash");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

var corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ["POST"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(express.json());
app.use(cors(corsOptions));

app.post("/", (req, res) => {
  try {
    const { name, company, email, phoneNumber, message } = req.body;

    const text = `
    Name: ${name}
    Company: ${company}
    Email: ${email}
    Phone Number: ${phoneNumber}
    Message: ${message}
    `;

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_FROM,
      subject: process.env.MAIL_SUBJECT,
      text,
    };

    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        res.status(500).json({ message: "Internal Error" });
      } else {
        res.status(200).json({ message: "Email sent successfully" });
      }
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.log(error);
  }
});

app.get("/", (req, res) => {
  res.status(404).json(`Not Found`);
});

app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});
