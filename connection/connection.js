const mongoose = require("mongoose");
const vars = require("../var");
const mongoURI = vars.MONGO_CONNECTION_STRING;

const connectToMongo = async () => {
  try {
    await mongoose
      .connect(mongoURI)
      .then(() => console.log("MongoDB Connected..."));
  } catch (error) {
    console.log("Error connecting to Mongo DB" , error);
  }
};

module.exports = connectToMongo;
