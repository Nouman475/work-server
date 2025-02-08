const User = require("../Models/user");

const getUsersByReferralCode = async (req, res) => {
  try {
    const { referralCode } = req.params;

    const referredUsers = await User.find({ referredBy: referralCode });

    if (!referredUsers.length) {
      return res.status(200).json({
        success: false,
        message: "No users found for the provided referral code.",
      });
    }

    res.status(200).json({
      success: true,
      data: referredUsers,
    });
  } catch (error) {
    console.error("Error fetching referred users:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

module.exports = {
  getUsersByReferralCode,
};
