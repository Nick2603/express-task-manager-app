const { Types } = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/models/user");
const Task = require("../../src/models/task");

const userOneId = new Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: "Mike",
  email: "mike@example.com",
  password: "56what!!?",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};

const userTwoId = new Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: "Jess",
  email: "jess@example.com",
  password: "myHouse099?",
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
    },
  ],
};

const taskOneId = new Types.ObjectId();
const taskOne = {
  _id: taskOneId,
  description: "First task",
  completed: false,
  owner: userOne._id,
};

const taskTwoId = new Types.ObjectId();
const taskTwo = {
  _id: taskTwoId,
  description: "Second task",
  completed: true,
  owner: userOne._id,
};

const taskThreeId = new Types.ObjectId();
const taskThree = {
  _id: taskThreeId,
  description: "Third task",
  completed: true,
  owner: userTwo._id,
};

const SetupDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  taskOneId,
  taskOne,
  taskTwoId,
  taskTwo,
  taskThreeId,
  taskThree,
  SetupDatabase,
};
