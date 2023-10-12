const Task = require("../models/Task");
const { getImage, deleteImage } = require("../helpers/images");
const { TaskErrors } = require("../helpers/HandleValidationErrors");

const get_tasks = async (req, res) => {
  try {
    let tasks = await Task.find({ user: req.user._id });

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const get_task = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    res.status(200).json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const add_task = async (req, res) => {
  try {
    let img;
    if (req.file) {
      img = getImage(req.file);
    }

    const task = await Task.create({
      user: req.user._id,
      ...req.body,
      image: img,
    });

    res.status(201).json({ task, message: "Task created successfully" });
  } catch (err) {
    const { errors, message } = TaskErrors(err);
    if (message) res.status(400).json({ errors, message });
    else
      res
        .status(500)
        .json({ message: "Something went wrong. try again later" });
  }
};
const update_task = async (req, res) => {
  try {
    let img;
    let { id } = req.params;
    let task = await Task.findById(id);

    if (task.user.toString() != req.user._id.toString()) {
      if (req.file) {
        deleteImage(req.file);
      }
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }

    if (req.file) {
      img = getImage(req.file);
      if (task.image) deleteImage(task.image);
    }
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { ...req.body, image: img },
      { runValidators: true, new: true }
    );
    res
      .status(200)
      .json({ task: updatedTask, message: "Task updated successfully" });
  } catch (err) {
    const { errors, message } = TaskErrors(err);
    if (message) res.status(400).json({ errors, message });
    else
      res
        .status(500)
        .json({ message: "Something went wrong. try again later" });
  }
};
const delete_task = async (req, res) => {
  try {
    let { id } = req.params;
    let task = await Task.findById(id);
    if (task.user.toString() != req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this task" });
    }

    if (task.image) deleteImage(task.image);

    await Task.findByIdAndDelete(id);

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  add_task,
  update_task,
  delete_task,
  get_tasks,
  get_task,
};
