const HttpError = require("../models/http-error");

const Accommodation = require("../models/accommodation");

module.exports = async (req, res, next) => {
  let accommodation;

  try {
    accommodation = await Accommodation.findById(req.params.aid).lean();
    if (!accommodation) throw new Error();
  } catch (err) {
    console.log(err.message);
    const error = new HttpError(
      "No accommodation with the provided id exists",
      404
    );
    return next(error);
  }

  req.accommodation = { ...accommodation };
  return next();
};
