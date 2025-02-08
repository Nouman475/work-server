const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String,
      default:
        "https://png.pngtree.com/png-vector/20220709/ourmid/pngtree-businessman-user-avatar-wearing-suit-with-red-tie-png-image_5809521.png",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    lives: {
      type: String,
    },
    birthday: {
      type: Date,
    },
    school: {
      type: String,
    },
    Rank: {
      type: String,
      default: "Starter",
    },
    works: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    twoFASecret: {
      type: String,
    },
    twoFAEnabled: {
      type: Boolean,
    },
    twoFAEnabledQr: {
      type: String,
    },
    referralCode: {
      type: String,
      unique: true,
    },
    referredBy: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rewardPoints: {
      type: Number,
      default: 0,
    },
    addresses: {
      type: [String],
    },
    wallet: {
      balance: {
        type: Number,
        default: 0,
      },
      address: {
        type: String,
      },
    },
    rankUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (!this.referralCode) {
    this.referralCode = uuidv4().slice(0, 8);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
