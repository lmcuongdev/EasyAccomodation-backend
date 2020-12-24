const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dot = require("dot-object");

const { deletePropertyPath } = require("../util/helper");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const createToken = (data) => {
  return jwt.sign(data, process.env.JWT_KEY, { expiresIn: "1w" });
};

module.exports = {
  getUsers: async (req, res, next) => {
    let users;
    try {
      users = await User.find({}, "-password");
    } catch (err) {
      const error = new HttpError(
        "Fetching users failed, please try again later.",
        500
      );
      return next(error);
    }
    res.json({ users: users.map((user) => user.toObject()) });
  },

  getUserById: async (req, res, next) => {
    let user;
    try {
      user = await User.findOne({ _id: req.params.uid });
    } catch (err) {
      const error = new HttpError("No user with the provided id exists", 404);
      return next(error);
    }
    res.json({ user: user.toObject() });
  },

  updateUser: async (req, res, next) => {
    const { role, userId } = req.userData;
    const isAdmin = role === "admin";

    let user;
    try {
      user = await User.findById(req.params.uid).lean({ virtuals: true });
      if (!user) throw new Error();
    } catch (err) {
      return next(new HttpError("Provided user id not exists"));
    }

    if (!isAdmin && user._id.toString() !== userId) {
      return next(new HttpError("You are not allowed", 403));
    }

    const updatedData = req.body;
    // filter update data for mass assignment
    for (const prop of user.protected) {
      deletePropertyPath(updatedData, prop);
    }

    try {
      const updated = await User.findOneAndUpdate(
        { _id: user._id },
        {
          $set: dot.dot(updatedData),
        },
        { new: true, useFindAndModify: false }
      );
      res.json({ updated });
    } catch (err) {
      return new HttpError("Cant update user", 401);
    }
  },

  signUp: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError("Invalid inputs passed, please check your data.", 422)
      );
    }

    const { name, email, password, role } = req.body;

    let existingUser;
    try {
      existingUser = await User.findOne({ email: email });
    } catch (err) {
      const error = new HttpError(
        "Signing up failed, please try again later.",
        500
      );
      return next(error);
    }

    if (existingUser) {
      const error = new HttpError(
        "User exists already, please login instead.",
        422
      );
      return next(error);
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 8);
    } catch (err) {
      const error = new HttpError(
        "Could not create user, please try again.",
        500
      );
      return next(error);
    }

    const createdUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    if (role === "owner") {
      const { address, citizen_id, phone } = req.body;
      if (!address || !citizen_id || !phone) {
        return next(
          new HttpError("Invalid inputs passed, please check your data.", 422)
        );
      }
      createdUser.owner_info = {
        is_verified: false,
        address,
        citizen_id,
        phone,
      };
    }

    try {
      await createdUser.save();
    } catch (err) {
      return next(
        new HttpError("Invalid inputs passed, please check your data.", 422)
      );
    }

    let token;
    try {
      token = createToken({
        userId: createdUser.id,
        email: createdUser.email,
        role,
      });
    } catch (err) {
      const error = new HttpError(
        "Signing up failed, please try again later.",
        500
      );
      return next(error);
    }

    res.status(201).json({
      userId: createdUser.id,
      ...createdUser.toObject(),
      token: token,
    });
  },

  login: async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;

    try {
      existingUser = await User.findOne({ email: email });
    } catch (err) {
      const error = new HttpError(
        "Logging in failed, please try again later.",
        500
      );
      return next(error);
    }

    if (!existingUser) {
      const error = new HttpError(
        "Invalid credentials, could not log you in.",
        401
      );
      return next(error);
    }

    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
      const error = new HttpError(
        "Could not log you in, please check your credentials and try again.",
        500
      );
      return next(error);
    }

    if (!isValidPassword) {
      const error = new HttpError(
        "Invalid credentials, could not log you in.",
        401
      );
      return next(error);
    }

    let token;
    try {
      token = createToken({
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      });
    } catch (err) {
      const error = new HttpError(
        "Logging in failed, please try again later.",
        500
      );
      return next(error);
    }

    res.json({
      userId: existingUser.id,
      ...existingUser.toObject(),
      token: token,
    });
  },
};
