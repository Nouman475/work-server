const User = require("../Models/user");

const AllotRank = async (req, res) => {
  try {
    const { referralCode } = req.params;

    const referringUser = await User.findOne({ referralCode });
    if (!referringUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const referredUsers = await User.find({ referredBy: referralCode }).sort({
      createdAt: 1,
    });

    const UsersCount = referredUsers.length;

    const rankData = [
      { threshold: 10, rank: "Gold", bonus: 10 },
      { threshold: 5, rank: "Silver", bonus: 5 },
      { threshold: 2, rank: "Bronze", bonus: 2 },
    ];

    const { rank, bonus } = rankData.find(
      ({ threshold }) => UsersCount >= threshold
    ) || { rank: "Starter", bonus: 0 };

    if (referringUser.Rank !== rank) {
      referringUser.Rank = rank;
      referringUser.rankUpdatedAt = new Date();
      await referringUser.save();
    }

    res.status(200).json({
      message: "Rank updated based on referrals",
      totalReferredUsers: UsersCount,
      assignedRank: rank,
      updatedWalletBalance: referringUser.wallet.balance,
      rankUpdatedAt: referringUser.rankUpdatedAt, // Include timestamp
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Function to get user summary with timestamps
const getUserSummary = async (req, res) => {
  try {
    const { referralCode } = req.params;

    const user = await User.findOne({ referralCode });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const referredUsers = await User.find({ referredBy: referralCode }).sort({
      createdAt: 1,
    });

    const formattedReferredUsers = referredUsers.map((refUser) => ({
      username: refUser.username,
      email: refUser.email,
      rank: refUser.Rank,
      createdAt: refUser.createdAt,
    }));

    res.status(200).json({
      username: user.username,
      email: user.email,
      referralCode: user.referralCode,
      rank: user.Rank,
      totalReferredUsers: referredUsers.length,
      walletBalance: user.wallet.balance,
      referredUsers: formattedReferredUsers, // Include detailed referred user data
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { AllotRank, getUserSummary };
