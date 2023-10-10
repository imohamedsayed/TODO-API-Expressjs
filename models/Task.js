const mongoose = require("mongoose");
const { deleteImage, deleteImages } = require("../helpers/images");

const TaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Blog must belong to a specific user"],
  },
  title: {
    type: String,
    trim: true,
    required: [true, "Please add task name"],
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

TaskSchema.pre("deleteOne", async () => {
  try {
    const task = await this.model.findOne(this.getQuery());
    if (!task) {
      return next();
    }
    if (task.image) {
      deleteImage(task.image);
    }
    next();
  } catch (error) {
    next(error);
  }
});
TaskSchema.pre("deleteMany", async function (next) {
  try {
    const tasks = await this.model.find(this.getQuery());

    const imagePathsToDelete = tasks.flatMap((task) => {
      if (task.image) return task.image;
    });
    if (imagePathsToDelete.length) deleteImages(imagePathsToDelete);
    next();
  } catch (error) {
    next(error);
  }
});

const Task = mongoose.model("Task", TaskSchema);
module.exports = Task;
