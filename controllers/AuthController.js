const User = require("../models/User");
const { AuthErrors } = require("../helpers/HandleValidationErrors");

const maxAge = 1 * 24 * 60 * 60 * 1000; // one day in msec

const signup = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = await user.generateToken();

    res.cookie("jwt", `Bearer ${token}`, {
      httpOnly: true,
      maxAge: maxAge,
      sameSite: "none",
      secure: true,
    });

    delete user.tokens;

    res.status(201).json({ user, message: "Account created successfully" });
  } catch (error) {
    const { errors, message } = AuthErrors(error);
    if (message) res.status(401).json({ errors, message });
    else
      res
        .status(500)
        .json({ message: "Something went wrong,please try again later" });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.login({ email, password });
    const token = await user.generateToken();

    res.cookie("jwt", `Bearer ${token}`, {
      httpOnly: true,
      maxAge: maxAge,
      sameSite: "none",
      secure: true,
    });
    res.status(200).json({ user, message: "Logged in successfully" });
  } catch (error) {
    const { errors, message } = AuthErrors(error);
    if (message) res.status(401).json({ errors, message });
    else
      res
        .status(500)
        .json({ message: "Something went wrong,please try again later" });
  }
};
const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      maxAge: 1,
      sameSite: "none",
      secure: true,
    });
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { tokens: req.token },
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong,please try again later" });
  }
};

module.exports = {
  signup,
  login,
  logout,
};
