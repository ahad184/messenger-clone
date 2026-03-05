/**
 * Auth Routes
 * POST /api/auth/register  - Register new user
 * POST /api/auth/login     - Login user
 * POST /api/auth/logout    - Logout user (protected)
 * GET  /api/auth/me        - Get current user (protected)
 */

const express = require("express");
const router = express.Router();
const { register, login, logout, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

module.exports = router;
