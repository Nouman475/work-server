// Importing packages
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const connectToMongo = require("./connection/connection");

// Importing routes
const auth = require("./Routes/authenticate");
const payments = require("./Routes/payments");

const app = express();

// Connect to MongoDB
connectToMongo();

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const PORT = process.env.PORT;

// Routes
app.use("/api/v1", auth);
app.use("/api/v2", payments);

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

module.exports = app;
