const mongoose = require("mongoose");

const ReferralTransactionSchema = new mongoose.Schema({
  referredUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amountEarned: { type: Number, required: true },
  level: { type: Number, required: true }, 
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  "ReferralTransaction",
  ReferralTransactionSchema
);
