const { Router } = require("express");
const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/user");
const auth = require("../middleware/auth");
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");

const router = new Router();

const addUser = async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
};

router.post("/users", addUser);

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
};

router.post("/users/login", loginUser);

const logoutUser = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
};

router.post("/users/logout", auth, logoutUser);

const logoutAllUser = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
};

router.post("/users/logoutAll", auth, logoutAllUser);

const getMyProfile = async (req, res) => {
  res.send(req.user);
};

router.get("/users/me", auth, getMyProfile);

// const getUser = async (req, res) => {
//   const _id = req.params.id;
//   try {
//     const user = await User.findById(_id).exec();
//     if (!user) {
//       return res.status(404).send("User is not found!");
//     }
//     res.send(user);
//   } catch (err) {
//     res.status(500).send();
//   }
// };

// router.get("/users/:id", getUser);

const updateUser = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "age", "email", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send("Invalid update data!");
  }
  const update = req.body;
  try {
    const user = req.user;
    updates.forEach((value) => (user[value] = update[value]));
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
};

router.patch("/users/me", auth, updateUser);

const deleteUser = async (req, res) => {
  try {
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (err) {
    res.status(500).send();
  }
};

router.delete("/users/me", auth, deleteUser);

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("File must be a jpg, jpeg or png"));
    }
    cb(undefined, true);
  },
});

const uploadAvatar = async (req, res) => {
  const buffer = await sharp(req.file.buffer)
    .png()
    .resize({ width: 250, height: 250 })
    .toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.send();
};

const errorHandler = (error, req, res, next) => {
  res.status(400).send({
    error: error.message,
  });
};

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  uploadAvatar,
  errorHandler
);

const deleteAvatar = async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
};

router.delete("/users/me/avatar", auth, deleteAvatar);

const getAvatar = async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await User.findById(_id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (err) {
    res.status(404).send();
  }
};

router.get("/users/:id/avatar", getAvatar);

module.exports = router;
