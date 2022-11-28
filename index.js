const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const cors = require("cors");
const _ = require("lodash");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { validate } = require("deep-email-validator");

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
  optionsSuccessStatus: 200,
};

const limiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 1, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipFailedRequests: true,
  message: {
    status: 429,
    message: "Too many requests, please try again later in 30 minutes.",
  },
});

app.use(express.json());
app.use(cors(corsOptions));

app.post("/", limiter, async (req, res) => {
  try {
    const { name, company, email, phoneNumber, message } = req.body;

    return res
      .status(200)
      .json({ status: 200, message: "Email sent successfully" });

    const mailValid = await validate({
      email,
      validateRegex: true,
      validateMx: true,
      validateTypo: false,
      validateDisposable: true,
      validateSMTP: false,
    });

    if (!mailValid.valid) {
      return res.status(400).json({ status: 400, message: "Invalid email." });
    }

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
        return res.status(400).json({ status: 400, message: "Internal Error" });
      } else {
        return res
          .status(200)
          .json({ status: 200, message: "Email sent successfully" });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: 400, message: error.message });
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
