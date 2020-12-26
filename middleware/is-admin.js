const HttpError = require("../models/http-error");

// **** MUST USE AFTER check-auth middleware ****
module.exports = (req, res, next) => {
  if (req.userData.role === "admin") {
    return next();
  }

  next(new HttpError("You are not allowed", 403));
};
