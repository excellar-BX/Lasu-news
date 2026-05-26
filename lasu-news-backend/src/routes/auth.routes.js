const express = require("express");
const router = express.Router();
const { signup, login, refresh, logout, me } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, me);

module.exports = router;