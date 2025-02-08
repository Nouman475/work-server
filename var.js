const dotenv = require('dotenv').config();

const vars = {
    PORT: process.env.PORT,
    MONGO_CONNECTION_STRING: process.env.MONGO_CONNECTION_STRING,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET
}

module.exports = vars;
