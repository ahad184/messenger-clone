/**
 * User Controller
 * Handles user search, profile updates, and status
 */

const User = require("../models/User");
const upload = require("../middleware/upload.middleware");
const path = require("path");

/**
 * @route   GET /api/users
 * @desc    Search users by username or email (excluding self)
 * @access  Private
 */
const searchUsers = async (req, res) => {
  try {
    const searchTerm = req.query.search || "";
    const currentUserId = req.user._id;

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { username: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ],
    }).select("-password");

    res.json({ users });
  } catch (error) {
    console.error("Search users error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get a user's public profile
 * @access  Private
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update own profile (username, bio)
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { username, bio } = req.body;
    let profilePicture;

    // If a file was uploaded, set the URL path
    if (req.file) {
      profilePicture = `/uploads/${req.file.filename}`;
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePicture) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({ user });
  } catch (error) {
    console.error("Update profile error:", error.message);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username already taken" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { searchUsers, getUserById, updateProfile };
