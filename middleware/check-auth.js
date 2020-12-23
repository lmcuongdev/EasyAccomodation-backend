const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  let token;
  try {
    token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error("Authentication failed!");
    }
  } catch (err) {
    const error = new HttpError("Authentication failed", 401);
    return next(error);
  }

  try {
    jwt.verify(token, process.env.JWT_KEY, (err, decodedToken) => {
      if (err) {
        // invalid token
        if (err instanceof jwt.JsonWebTokenError) {
          return next(new HttpError(err.message, 400));
        }
        // token expired
        throw err;
      }
      req.userData = { ...decodedToken };
      next();
    });
  } catch (err) {
    const error = new HttpError(err.message, 401);
    return next(error);
  }
};
