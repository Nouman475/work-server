const bcrypt = require("bcryptjs");
const User = require("../Models/user");
const OTP = require("../Models/otp");

const forgotPasswordController = {
  // Step 1: Generate and Save OTP
  async sendOTP(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate 4-digit OTP
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

      // Save OTP in database (remove existing OTP for this user first)
      await OTP.deleteMany({ userId: user._id });

      const otpEntry = new OTP({ userId: user._id, otp: otpCode });
      await otpEntry.save();

      console.log(`OTP for ${email}: ${otpCode}`); // Since no email service, log OTP

      res
        .status(200)
        .json({ message: "OTP sent successfully", userId: user._id });
    } catch (error) {
      console.error("OTP Generation Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Step 2: Verify OTP
  async verifyOTP(req, res) {
    try {
      const { otp } = req.body;
      const { userId } = req.params;
      if (!userId || !otp) {
        return res
          .status(400)
          .json({ message: "User ID and OTP are required" });
      }

      // Find OTP in DB
      const otpRecord = await OTP.findOne({ userId, otp });

      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // OTP is valid, proceed to allow password update
      res
        .status(200)
        .json({ message: "OTP verified, you can now update your password" });
    } catch (error) {
      console.error("OTP Verification Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Step 3: Update Password
  async updateForgotPassword(req, res) {
    try {
      const { newPassword } = req.body;
      const { userId } = req.params;

      if (!userId || !newPassword) {
        return res
          .status(400)
          .json({ message: "User ID and new password are required" });
      }

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user password
      user.password = hashedPassword;
      await user.save();

      // Remove OTP after successful password change
      await OTP.deleteMany({ userId });

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Update Password Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

module.exports = forgotPasswordController;
