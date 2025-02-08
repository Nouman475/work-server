const bcrypt = require("bcryptjs");
const User = require("../Models/user");
const userDTO = require("../DTO/AuthDTO");
const JWTservices = require("../services/JWTservices");

// const giveReferralRewards = async (referralCode) => {
//   try {
//     const rewardLevels = [10, 5, 3];
//     let currentReferralCode = referralCode;
//     let level = 0;

//     while (currentReferralCode) {
//       const user = await User.findOne({ referralCode: currentReferralCode });
//       if (!user) break;
      
//       user.rewardPoints += rewardLevels[level];
//       await user.save();
      
//       currentReferralCode = user.referredBy;
//       level++;
//     }
//   } catch (error) {
//     console.error("Error in referral rewards:", error);
//   }
// };


const authController = {
  // ============================ User registration ==============================
  async register(req, res) {
    try {
      const { fullName, email, password } = req.body;
      const { referralCode } = req.params;

      // Validate input fields
      if (!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // //AWARD FOR THE USER

      // if (referralCode) {
      //   await giveReferralRewards(referralCode);
      // }
      
      // Hash the password before saving the user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
        fullName,
        email,
        password: hashedPassword,
        referredBy: referralCode || null, // Store referral code if provided
      });

      // Save user to database
      const user = await newUser.save();

      // Generate tokens
      const AccessToken = JWTservices.signAccessToken(
        { _id: user._id, username: user.email, fullName: user.fullName },
        "30m"
      );

      const RefreshToken = JWTservices.signRefreshToken(
        { _id: user._id },
        "60m"
      );

      // Store refresh token in database
      await JWTservices.storeRefreshToken(RefreshToken, user._id);

      // Set cookies
      res.cookie("AccessToken", AccessToken, {
        maxAge: 1000 * 60 * 30, // 30 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.cookie("RefreshToken", RefreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      // Prepare user response
      const userResponse = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
      };

      res.status(201).json({
        user: userResponse,
        message: "User registered successfully",
        accessToken: AccessToken,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // ================================= User login ===========================
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found, please sign up" });
      }

      // Check if the password is correct
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate tokens
      const AccessToken = JWTservices.signAccessToken(
        { _id: user._id, username: user.email, fullName: user.fullName },
        "30m"
      );

      const RefreshToken = JWTservices.signRefreshToken(
        { _id: user._id },
        "60m"
      );

      // Set cookies
      res.cookie("AccessToken", AccessToken, {
        maxAge: 1000 * 60 * 30, // 30 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.cookie("RefreshToken", RefreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      // Prepare user response
      const userDto = new userDTO(user);

      res.status(200).json({
        message: "Login successful",
        user: userDto,
        accessToken: AccessToken,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // ================================ Add address method ===============
  async addAddress(req, res) {
    try {
      const { newAddress } = req.body;
      const userId = req.params.id;

      // Validate input
      if (
        !newAddress ||
        typeof newAddress !== "string" ||
        newAddress.trim() === ""
      ) {
        return res
          .status(400)
          .json({ error: "New address must be a non-empty string." });
      }

      // Find and update the user
      const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { addresses: newAddress } }, // Prevent duplicate addresses
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      // Return success response
      res.status(200).json({
        message: "Address added successfully.",
        addresses: user.addresses, // Return updated addresses
      });
    } catch (error) {
      console.error("Error adding address:", error);

      // Handle specific Mongoose validation errors
      if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: "Internal server error." });
    }
  },
  // ============================== Logout method ===================================
  async logout(req, res) {
    try {
      // Clear tokens from cookies
      res.clearCookie("AccessToken");
      res.clearCookie("RefreshToken");

      // Optional: Remove refresh token from database
      if (req.user && req.user._id) {
        await JWTservices.removeRefreshToken(req.user._id);
      }

      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Get user data by ID
  async getUserById(req, res) {
    try {
      const userId = req.params.id;

      // Find user by ID
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // =================  Update Password Functionality ================================
  async updatePassword(req, res) {
    try {
      const { previousPassword, newPassword } = req.body;
      const userId = req.params.id; // Extract user ID from route params

      // Validate input fields
      if (!previousPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "Both previous and new passwords are required" });
      }

      // Find user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the previous password is correct
      const isPasswordCorrect = await bcrypt.compare(
        previousPassword,
        user.password
      );
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Incorrect previous password" });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      // Update password in the database
      user.password = hashedNewPassword;
      await user.save();

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Update password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = authController;
