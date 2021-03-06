const express = require("express");
const { check } = require("express-validator");

const accommodControllers = require("../controllers/accommodations-controllers");

const checkAuth = require("../middleware/check-auth");
const isAccommod = require("../middleware/is-accommod");
const fileUpload = require("../middleware/file-upload");
const reviewsControllers = require("../controllers/reviews-controllers");
const reportsControllers = require("../controllers/reports-controllers");

const router = express.Router();

router.get("/", accommodControllers.getAll);
router.get("/:aid", isAccommod, accommodControllers.getOne);
router.get("/:aid/addview", isAccommod, accommodControllers.addView);

router.get("/:aid/reviews", isAccommod, reviewsControllers.getAllByAccommodId);
router.get("/:aid/reports", isAccommod, reportsControllers.getAllByAccommodId);

// must be authenticated
router.use(checkAuth);

router.post(
	"/create",
	// fileUpload.single("image"),
	[
		check("type").isIn([
			"motel",
			"mini-apartment",
			"apartment",
			"detached-house",
		]),
	],
	accommodControllers.create
);
router.put("/:aid", isAccommod, accommodControllers.update);
router.delete("/:aid", isAccommod, accommodControllers.delete);

router.post("/:aid/reviews/create", isAccommod, reviewsControllers.create);
router.post("/:aid/reports/create", isAccommod, reportsControllers.create);

module.exports = router;
