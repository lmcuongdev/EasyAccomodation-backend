const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Accommodation = require("../models/accommodation");
const Report = require("../models/report");

module.exports = {
  getAllByAccommodId: async (req, res, next) => {
    let accommod;

    try {
      accommod = await Accommodation.populate(req.accommodation, {
        path: "reports",
        populate: "author",
      });
    } catch (err) {
      return next(new HttpError("Something went wrong", 500));
    }

    res.json({ reports: accommod.reports });
  },

  create: async (req, res, next) => {
    const session = await mongoose.startSession();

    // start transaction
    session.startTransaction();

    const { type, description } = req.body;

    const data = {
      reporter: req.userData.userId,
      accommodation: req.accommodation._id,
      type,
      description,
    };

    let report;
    try {
      report = new Report(data);
      await report.save({ session });
    } catch (err) {
      return next(
        new HttpError("Invalid inputs passed, please check your data.", 422)
      );
    }

    try {
      await report.populate("accommodation").execPopulate();

      report.accommodation.reports.push(report.id);

      await report.accommodation.save({ session });
      await session.commitTransaction();

      // await session.abortTransaction();
    } catch (err) {
      return next(new HttpError(err.message || "Something went wrong", 500));
    }

    res.json({ report: { ...data, _id: report.id } });
  },

  getAll: async (req, res, next) => {
    let reports;

    try {
      reports = await Report.find({}).lean();
    } catch (err) {
      return next(new HttpError("Something went wrong", 500));
    }

    res.json({ reports });
  },
};
