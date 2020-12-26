const express = require("express");

const router = express.Router();

router.use("/users", require("./users-routes"));
router.use("/accommodations", require("./accommodations-routes"));
router.use("/reviews", require("./review-routes"));
router.use("/reports", require("./report-routes"));

router.get("/test", (req, res) => res.json(req.query));
router.post("/test", (req, res) => res.json(req.body));

module.exports = router;
