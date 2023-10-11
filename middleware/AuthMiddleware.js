const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  try {
    if (!req.cookies?.jwt) {
      return res.status(401).json({ message: "You are not authenticated" });
    }
    const [, token] = req.cookies?.jwt?.split(" ");
    if (!token) {
      return res.status(401).json({ message: "You are not authenticated" });
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) return res.status(401).json({ message: "Token is invalid" });

      const user = await User.findById(decodedToken.id);
      if (!user)
        return res.status(401).json({ message: "You are not authorized" });

      if (user.tokens.includes(token)) {
        req.user = user;
        req.token = token;
        next();
      } else {
        return res.status(401).json({ message: "You are not authorized" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  requireAuth,
};
