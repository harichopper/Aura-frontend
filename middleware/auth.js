const Users = require("../models/userModel");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ msg: "Invalid Authentication." });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) {
      return res.status(401).json({ msg: "Invalid Authentication." });
    }

    const user = await Users.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

module.exports = auth;
