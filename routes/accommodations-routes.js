const express = require("express");
const { check } = require("express-validator");

const accommodControllers = require("../controllers/accommodations-controllers");

const checkAuth = require("../middleware/check-auth");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", accommodControllers.getAll);
router.get("/:aid", accommodControllers.getOne);

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
router.put("/:aid", accommodControllers.update);
router.delete("/:aid", accommodControllers.delete);

module.exports = router;
