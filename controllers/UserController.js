const User = require("../models/User");
const { AuthErrors } = require("../helpers/HandleValidationErrors");
const { getImage, deleteImage } = require("../helpers/images");

const update_name_email = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { email, name },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({ user, message: "User updated successfully" });
  } catch (error) {
    const { errors, message } = AuthErrors(error);
    if (message) {
      res.status(400).json({ errors, message });
    } else {
      res
        .status(500)
        .json({ message: "Something went wrong. please try again later." });
    }
  }
};
const change_profile_picture = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a profile picture" });
  }
  try {
    const img = getImage(req.file);
    if (req.user.image != "user.jpg") deleteImage(req.user.image);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { image: img },
      { new: true, runValidators: true }
    );

    res
      .status(200)
      .json({ user, message: "Profile picture changed successfully" });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Something went wrong. please try again later." });
  }
};
const change_password = async (req, res) => {
  try {
    const { newPassword, oldPassword } = req.body;

    const user = await User.changePassword({
      id: req.user._id,
      oldPassword,
      newPassword,
    });

    res.status(200).json({ user, message: "Password changed successfully" });
  } catch (err) {
    const { errors, message } = AuthErrors(err);
    if (message) {
      res.status(400).json({ errors, message });
    } else {
      res
        .status(500)
        .json({ message: "Something went wrong. please try again later." });
    }
  }
};

module.exports = {
  update_name_email,
  change_profile_picture,
  change_password,
};
