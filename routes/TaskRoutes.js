const router = require("express").Router();
const TaskController = require("../controllers/TaskController");
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

router.get("/", requireAuth, TaskController.get_tasks);
router.get("/:id", requireAuth, TaskController.get_task);

router.post("/", requireAuth, upload.single("image"), TaskController.add_task);

router.patch(
  "/:id",
  requireAuth,
  upload.single("image"),
  TaskController.update_task
);

router.delete("/:id", requireAuth, TaskController.delete_task);

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
