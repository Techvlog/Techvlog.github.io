require("dotenv").config();
const jwt = require("jsonwebtoken");
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.firstName,
      email: user.email,
      avatar: user.avatar,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
}
function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token." });
  }
}
const checktoken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return false;
  }
};
module.exports = {
  generateToken,
  authenticateToken,
  checktoken,
};
