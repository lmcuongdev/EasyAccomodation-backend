const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Accommodation = require("../models/accommodation");
const Review = require("../models/review");

module.exports = {
  getAllByAccommodId: async (req, res, next) => {
    let accommod;

    try {
      accommod = await Accommodation.populate(req.accommodation, {
        path: "reviews",
        populate: "author",
      });
    } catch (err) {
      return next(new HttpError("Something went wrong", 500));
    }

    res.json({ reviews: accommod.reviews });
  },

  create: async (req, res, next) => {
    const session = await mongoose.startSession();

    // start transaction
    session.startTransaction();

    const { comment, rating } = req.body;

    const data = {
      author: req.userData.userId,
      accommodation: req.accommodation._id,
      comment,
      rating,
      status: req.userData.role === "admin" ? "verified" : "pending",
    };

    let review;
    try {
      review = new Review(data);
    } catch (err) {
      return next(
        new HttpError("Invalid inputs passed, please check your data.", 422)
      );
    }
    try {
      await review.save({ session });
      await review.populate("accommodation").execPopulate();

      review.accommodation.reviews.push(review.id);

      await review.accommodation.save({ session });
      await session.commitTransaction();

      // await session.abortTransaction();
    } catch (err) {
      return next(new HttpError("Something went wrong", 500));
    }

    res.json({ review: { ...data, _id: review.id } });
  },

  getAll: async (req, res, next) => {
    let reviews;
    try {
      reviews = await Review.find({}).lean();
    } catch (err) {
      const error = new HttpError(
        "Fetching reviews failed, please try again later.",
        500
      );
      return next(error);
    }
    res.json({ reviews });
  },
};
