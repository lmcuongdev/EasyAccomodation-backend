const express = require("express");

const reportsControllers = require("../controllers/reports-controllers");

const checkAuth = require("../middleware/check-auth");
const isAdmin = require("../middleware/is-admin");

const router = express.Router();

router.get("/", checkAuth, isAdmin, reportsControllers.getAll);

module.exports = router;
