const { User } = require("../models/authmodel");
const asyncHandler = require("express-async-handler");
const {
  generateToken,
  checktoken,
} = require("../service/jwtservice");

// ─── Sign Up ──────────────────────────────────────────────────────────────────
const signUp = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (token) {
    const decode = checktoken(token);
    if (decode) throw new Error("You are already logged in");
  }

  const { fstname, lstName, email, password, avatar } = req.body;

  if (!fstname || !lstName || !email || !password) {
    throw new Error("Please enter all required fields");
  }

 
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(400).json({ message: "Email is already registered" });
  }

  const user_instance = await User.create({
    firstName: fstname,
    lastName: lstName,
    email,
    password,
    avatar: avatar || null,
  });

  const tokenvalue = generateToken(user_instance);

  res.cookie("token", tokenvalue, {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: "lax",              // ✅ CSRF protection
  });

  res.status(201).json({
    id: user_instance.id,
    name: user_instance.firstName,
    email: user_instance.email,
    message: "Successfully signed up",
    status: 201,
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (token) {
    const decode = checktoken(token);
    if (decode) throw new Error("You are already logged in");
  }

  const { email, password } = req.body;

  if (!email || !password) {
    throw new Error("Fill all the fields");
  }

  const instance = await User.findOne({ where: { email } });
  if (!instance) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const match = await instance.isValidPassword(password);
  if (!match) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const tokenvalue = generateToken(instance);

  res.cookie("token", tokenvalue, {
    maxAge: 24 * 60 * 60 * 1000, // ✅ fixed: was 900000ms (15 min) — now consistent 24hr
    httpOnly: true,
    sameSite: "lax",              // ✅ CSRF protection
  });

  res.status(200).json({
    id: instance.id,
    name: instance.firstName,
    email: instance.email,
    message: "Successfully logged in",
    status: 200,
  });
});

// ─── Check Auth ───────────────────────────────────────────────────────────────
const check = (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.json({ username: null });

  const decode = checktoken(token);
  if (!decode) return res.json({ username: null });

  return res.json(decode);
};

// ─── Logout ───────────────────────────────────────────────────────────────────
const logout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  res.json({ message: "Logged out successfully" });
};

module.exports = {
  signUp,
  login,
  check,
  logout,
};