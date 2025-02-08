const speakeasy = require("speakeasy");
const qrCode = require("qrcode");
const User = require("../Models/user");

class TwoFAService {
  // Generate and enable 2FA for a user
  static async enable2FA(userId) {
    try {
      const secret = speakeasy.generateSecret({ name: "Three Arrows" });
      const qrCodeUrl = await qrCode.toDataURL(secret.otpauth_url);

      const user = await User.findByIdAndUpdate(
        userId,
        {
          twoFASecret: secret.ascii,
          twoFAEnabled: true,
          twoFAEnabledQr: qrCodeUrl,
        },
        { new: true }
      );

      if (!user) {
        return { success: false, message: "User not found" };
      }

      return { success: true, qrCodeUrl, secret: secret.ascii };
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      return { success: false, message: "Internal server error" };
    }
  }

  // Disable 2FA for a user
  static async disable2FA(userId) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { twoFASecret: null, twoFAEnabled: false, twoFAEnabledQr: null },
        { new: true }
      );

      if (!user) {
        return { success: false, message: "User not found" };
      }

      return { success: true, message: "2FA disabled successfully." };
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      return { success: false, message: "Internal server error" };
    }
  }

  // Verify 2FA token
  static async verify2FA(userId, token) {
    try {
      if (!token) {
        return { success: false, message: "2FA token is required" };
      }

      const user = await User.findById(userId);

      if (!user || !user.twoFAEnabled || !user.twoFASecret) {
        return { success: false, message: "2FA is not enabled for this user" };
      }

      const isValid = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: "ascii",
        token,
      });

      if (isValid) {
        return { success: true, message: "2FA verification successful." };
      } else {
        return { success: false, message: "Invalid 2FA token." };
      }
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      return { success: false, message: "Internal server error" };
    }
  }
}

module.exports = TwoFAService;
