const express = require("express");
const router = express.Router();
const { signup, login, refresh, logout, me, updateProfile } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, me);
router.put("/profile", protect, updateProfile);

module.exports = router;