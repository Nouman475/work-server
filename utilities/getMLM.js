const User = require("../Models/user");

const getReferralTree = async (req, res) => {
  try {
    const users = await User.find();
    const { userId } = req.params;
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const buildReferralTree = (user) => {
      return {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePhoto: user.profilePhoto,
        children: users
          .filter((u) => u.referredBy === user.referralCode)
          .map(buildReferralTree),
      };
    };

    const referralTree = buildReferralTree(currentUser);

    res.status(200).json(referralTree);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getReferralTree };
