const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/User");

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("products", {
    content: 1,
    date: 1,
  });
  response.json(users);
});

usersRouter.post("/", async (request, response) => {
  const { body } = request;
  const {
    username,
    name,
    password,
    direction,
    city,
    country,
    phone,
    email,
    photo
  } = body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
    direction,
    city,
    country,
    phone,
    email,
    photo,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

usersRouter.put("/:id", async (request, response) => {
  const { body } = request;
  const {
    direction,
    city,
    country,
    phone,
    email,
    photo,
  } = body;

  const newUser = new User({
    direction,
    city,
    country,
    phone,
    email,
    photo,
  });

  const savedUser = await newUser.save();

  response.status(201).json(savedUser);
});

module.exports = usersRouter;
