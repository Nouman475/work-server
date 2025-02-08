const User = require("../Models/user");

const getReferralTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find all users who were referred by this user
    const referredUsers = await User.find({ referredBy: user.referralCode });
    if (referredUsers.length === 0) {
      return res.status(200).json({ message: "No referrals found.", transactions: [] });
    }

    // Prepare referral transactions data
    const transactions = await Promise.all(
      referredUsers.map(async (refUser) => {
        return {
          referredUser: refUser.fullName,
          referredEmail: refUser.email,
          earnedAmount: refUser.wallet.balance,
        };
      })
    );

    return res.status(200).json({ message: "Referral transactions retrieved successfully.", transactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { getReferralTransactions };
