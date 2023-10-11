const router = require("express").Router();
const UserController = require("../controllers/UserController");
const { requireAuth } = require("../middleware/AuthMiddleware");
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image")) {
      cb(new Error("Unexpected image type"));
    } else {
      cb(null, true);
    }
  },
});

router.patch(
  "/update_email_name",
  requireAuth,
  UserController.update_name_email
);

router.patch(
  "/change_profile_picture",
  upload.single("image"),
  requireAuth,
  UserController.change_profile_picture
);

router.patch("/change_password", requireAuth, UserController.change_password);

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err.message === "Unexpected image type") {
    return res.status(400).json({ error: err.message });
  }
  res
    .status(500)
    .json({ message: "Something went wrong, please try again later." });
});

module.exports = router;
