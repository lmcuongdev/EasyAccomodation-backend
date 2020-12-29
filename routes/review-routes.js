const express = require("express");

const reviewsControllers = require("../controllers/reviews-controllers");

const checkAuth = require("../middleware/check-auth");
const isAdmin = require("../middleware/is-admin");

const router = express.Router();

router.get("/", checkAuth, reviewsControllers.getAll);

module.exports = router;
