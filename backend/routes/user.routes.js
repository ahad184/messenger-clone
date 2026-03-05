/**
 * User Routes
 * GET /api/users           - Search users (protected)
 * GET /api/users/:id       - Get user by ID (protected)
 * PUT /api/users/profile   - Update profile (protected)
 */

const express = require("express");
const router = express.Router();
const {
  searchUsers,
  getUserById,
  updateProfile,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

router.get("/", protect, searchUsers);
router.get("/:id", protect, getUserById);
router.put("/profile", protect, upload.single("profilePicture"), updateProfile);

module.exports = router;
