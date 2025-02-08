const router = require("express").Router();
const authController = require("../controller/AuthController");
const profileController = require("../controller/ProfileController");
const forgotPasswordController = require("../utilities/ForgotPassword");
const twoFAController = require("../utilities/twoFactor");
const { AllotRank, getUserSummary } = require("../utilities/Rank");
const {
  getReferralTransactions,
} = require("../utilities/getRefferalTransaction");
const { getReferralTree } = require("../utilities/getMLM");
const { getUsersByReferralCode } = require("../controller/userController");
const getUserRewards = require("../utilities/reward");
const { depositAmount } = require("../controller/DepositController");

// Public Routes
router.post("/register/:referralCode", authController.register);
router.post("/login", authController.login);

// Protected Routes
router.post("/addAddress/:id", authController.addAddress);
router.put("/updateProfile/:id", profileController.updateProfile);

// Fetch User by ID
router.get("/user/:id", authController.getUserById);

// Change user password
router.put("/updatePassword/:id", authController.updatePassword);

//   FORGOT PASSWORD ROUTES
router.post("/send-otp", forgotPasswordController.sendOTP);
router.post("/verify-otp/:userId", forgotPasswordController.verifyOTP);
router.post(
  "/update-password/:userId",
  forgotPasswordController.updateForgotPassword
);

//2FA ROUTES
router.post("/enable-2FA/:id", twoFAController.enable2FA);
router.post("/disable-2FA/:id", twoFAController.disable2FA);
router.post("/verify-2FA/:id", twoFAController.verify2FA);

// Route to get users referred by a specific referral code
router.get("/referrals/:referralCode", getUsersByReferralCode);

//Get user Reward
router.get("/rewards/:userId", getUserRewards);

//Get Transactions
router.get("/referral-transactions/:userId", getReferralTransactions);

//Get User Tree
router.get("/user-tree/:userId", getReferralTree);

//Allot rank to user
router.get("/allot-rank/:referralCode", AllotRank);

//Get summary for rank
router.get("/rank-summary/:referralCode", getUserSummary);

//Deposit Balance
router.post("/deposit-balance/:userId", depositAmount);

module.exports = router;
