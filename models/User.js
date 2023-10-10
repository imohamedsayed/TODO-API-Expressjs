const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const { deleteImage } = require("../helpers/images");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your full Name"],
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please enter your email"],
    validate: [isEmail, "Please enter a valid email"],
    trim: true,
  },
  image: {
    type: String,
    trim: true,
    default: "user.jpg",
  },
  password: {
    type: String,
    required: [true, "please add a passsword"],
    minLength: [6, "password must be at least 6 characters"],
    validate(val) {
      var strongRegex = new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"
      );
      if (!strongRegex.test(val))
        throw new Error(
          "Password must contain uppercase, lowercase, numbers and special characters"
        );
    },
    trim: true,
  },
  tokens: {
    type: [
      {
        type: String,
        expires: "1d",
        trim: true,
      },
    ],
  },
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.pre("deleteOne", async function (next) {
  try {
    const user = await this.model.findOne(this.getQuery());
    if (!user) {
      return next();
    }
    if (user.image !== "user.jpg") {
      deleteImage(user.image);
    }

    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.statics.login = async function ({ email, password }) {
  const user = await User.findOne({ email: email });
  if (user) {
    const passwordFlag = await bcrypt.compare(password, user.password);
    if (passwordFlag) {
      return user;
    }
    throw Error("Incorrect Password");
  } else {
    throw Error("Incorrect email");
  }
};
UserSchema.statics.changePassword = async function ({
  id,
  oldPassword,
  newPassword,
}) {
  const user = await this.findById(id);
  const passwordFlag = await bcrypt.compare(oldPassword, user.password);
  if (passwordFlag) {
    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(newPassword, salt);

    await this.findByIdAndUpdate(id, {
      password: hashed,
    });

    const updatedUser = await this.findById(id);

    return updatedUser;
  } else {
    throw Error("Incorrect old Password");
  }
};

UserSchema.methods.generateToken = async function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  this.tokens.push(token);

  await this.save();

  return token;
};

UserSchema.methods.toJSON = function () {
  const user = this;

  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.__v;

  return userObj;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
