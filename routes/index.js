const express = require("express");

const router = express.Router();

router.use("/users", require("./users-routes"));
router.use("/accommodations", require("./accommodations-routes"));

module.exports = router;
