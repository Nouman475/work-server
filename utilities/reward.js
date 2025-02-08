const User = require("../Models/user");
const getUserRewards = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, rewardPoints: user.rewardPoints });
  } catch (error) {
    console.error("Error fetching reward points:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = getUserRewards;
