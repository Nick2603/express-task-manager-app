const { Router } = require("express");
const auth = require("../middleware/auth");
const Task = require("../models/task");

const router = new Router();

const addTask = async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send(err);
  }
};

router.post("/tasks", auth, addTask);

const getTasks = async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    res.send(req.user.tasks);
  } catch (err) {
    res.status(500).send();
  }
};

// GET/tasks?completed=true
// GET/tasks?limit=2&skip=2
// GET/tasks?sortBy=createdAt:desc
router.get("/tasks", auth, getTasks);

const getTask = async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send("Task is not found!");
    }
    res.send(task);
  } catch (err) {
    res.status(500).send();
  }
};

router.get("/tasks/:id", auth, getTask);

const updateTask = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send("Invalid update data!");
  }
  const _id = req.params.id;
  const update = req.body;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send("Task is not found!");
    }
    updates.forEach((value) => (task[value] = update[value]));
    await task.save();
    res.send(task);
  } catch (err) {
    res.status(400).send(err);
  }
};

router.patch("/tasks/:id", auth, updateTask);

const deleteTask = async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send("Task is not found!");
    }
    res.send(task);
  } catch (err) {
    res.status(500).send();
  }
};

router.delete("/tasks/:id", auth, deleteTask);

module.exports = router;
