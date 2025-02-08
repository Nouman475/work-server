// Importing packages
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectToMongo = require("./connection/connection");

// Importing routes
const auth = require("./Routes/authenticate");

const app = express();

// Connect to MongoDB
connectToMongo();

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT;

// Routes
app.use("/api/v1", auth);

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

module.exports = app;
