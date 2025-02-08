const User = require("../Models/user");

const profileController = {
  // Update user's profile based on user ID
  async updateProfile(req, res) {
    try {
      const { id } = req.params; // User ID from the URL parameters
      const { fullName, profilePhoto, lives, works, school, birthday } = req.body;

      // Validate input: At least one field must be provided
      if (!fullName && !profilePhoto && !lives && !works && !school && !birthday) {
        return res.status(400).json({ message: "Please provide at least one field to update" });
      }

      // Prepare data for update
      const updateData = {};
      if (fullName) updateData.fullName = fullName;
      if (profilePhoto) updateData.profilePhoto = profilePhoto;
      if (lives) updateData.lives = lives;
      if (works) updateData.works = works;
      if (school) updateData.school = school;
      if (birthday) {
        const parsedDate = new Date(birthday);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
        updateData.birthday = parsedDate;
      }

      // Find and update the user
      const user = await User.findByIdAndUpdate(id, updateData, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
      });

      // Handle case if user not found
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return success response
      res.status(200).json({
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = profileController;
