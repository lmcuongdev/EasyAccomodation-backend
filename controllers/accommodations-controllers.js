const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const dot = require("dot-object");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const Accommodation = require("../models/accommodation");

module.exports = {
  getAll: async (req, res, next) => {
    let accommodations;
    try {
      accommodations = await Accommodation.find({}).lean();
    } catch (err) {
      const error = new HttpError(
        "Fetching accommodations failed, please try again later.",
        500
      );
      return next(error);
    }
    res.json({ accommodations });
  },

  getOne: async (req, res, next) => {
    let accommodation;
    try {
      accommodation = await User.findOne({ _id: req.params.uid }).lean();
    } catch (err) {
      const error = new HttpError(
        "No accommodation with the provided id exists",
        404
      );
      return next(error);
    }
    res.json({ accommodation });
  },

  create: async (req, res, next) => {
    const errors = validationResult(req);

    // if validation fails, return error
    if (!errors.isEmpty()) {
      return next(
        new HttpError("Invalid inputs passed, please check your data.", 422)
      );
    }

    const { userId, role } = req.userData;

    // only owner and admin is allowed
    if (role === "renter") {
      return next(new HttpError("You are not allowed", 403));
    }

    // create new accommodation
    let accommod;
    try {
      accommod = await Accommodation.safeCreate(req.body, userId);
    } catch (err) {
      return next(new HttpError(err.message, 422));
    }

    res.status(201).json({
      accommodation: accommod,
    });
  },

  update: async (req, res, next) => {
    const { role, userId } = req.userData;
    const isAdmin = role === "admin";
    let user;
    try {
      user = await User.findById(req.params.uid).lean({ virtuals: true });
    } catch (err) {
      return next(new HttpError("Provided user id not exists"));
    }

    if (!isAdmin && user._id.toString() !== userId) {
      return next(new HttpError("You are not allowed", 403));
    }

    const updatedData = req.body;
    // filter update data for mass assignment
    for (const prop of user.protected) {
      delete updatedData[prop];
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
