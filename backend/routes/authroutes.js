const {
  signUp,
  login,
  check,
  logout,
} = require("../controllers/authcontrollers");
const express = require("express");
const router = express.Router();
router.post("/signup", signUp);
router.post("/login", login);
router.get("/check", check);
router.get("/logout", logout);
module.exports = router;
