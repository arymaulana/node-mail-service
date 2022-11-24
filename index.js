const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const cors = require("cors");
const _ = require("lodash");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

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

    const emailBody = fs
      .readFileSync(path.join(__dirname, "templates/contact-form.hbs"), "utf8")
      .toString();

    const compiledTemplate = handlebars.compile(emailBody);

    const html = compiledTemplate({
      name,
      company,
      email,
      phoneNumber,
      message,
    });

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_FROM,
      subject: process.env.MAIL_SUBJECT,
      html,
    };

    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Internal Error" });
      } else {
        return res.status(200).json({ message: "Email sent successfully" });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/bot-register", (req, res) => {
  try {
    const { email, url } = req.body;

    const emailBody = fs
      .readFileSync(path.join(__dirname, "templates/bot-register.hbs"), "utf8")
      .toString();

    const compiledTemplate = handlebars.compile(emailBody);

    const html = compiledTemplate({ url });

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: email,
      subject:
        "Welcome to the Sourcing & Supply Chain Masterclass for eComm Course by SourciED!",
      html,
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
