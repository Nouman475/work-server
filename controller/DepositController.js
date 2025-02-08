const User = require("../Models/user");

const depositAmount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, depositAmount } = req.body;

    if (!email || !depositAmount) {
      return res
        .status(400)
        .json({ message: "Email and deposit amount are required." });
    }

    if (typeof depositAmount !== "number" || depositAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Deposit amount must be a positive number." });
    }

    // Find the depositing user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.email !== email) {
      return res
        .status(400)
        .json({ message: "Email does not match our records." });
    }

    // Update the user's wallet balance
    user.wallet.balance += depositAmount;
    await user.save();

    // MLM commission logic
    const rewardLevels = [10, 5, 3]; 
    let currentReferralCode = user.referredBy;
    let level = 0;

    while (currentReferralCode && level < 3) {
      const referrer = await User.findOne({ referralCode: currentReferralCode });

      if (!referrer) break;

      // Calculate bonus based on rank and level
      const bonusPercentage = rewardLevels[level];
      const bonusAmount = (depositAmount * bonusPercentage) / 100;

      if (bonusAmount > 0) {
        referrer.wallet.balance += bonusAmount;
        await referrer.save();
      }

      // Move to the next referral level
      currentReferralCode = referrer.referredBy;
      level++;
    }

    return res
      .status(200)
      .json({ message: "Deposit successful.", balance: user.wallet.balance });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { depositAmount };
