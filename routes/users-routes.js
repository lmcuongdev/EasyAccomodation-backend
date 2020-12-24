const express = require("express");
const { check } = require("express-validator");
const accommodationsControllers = require("../controllers/accommodations-controllers");

const usersController = require("../controllers/users-controllers");
const checkAuth = require("../middleware/check-auth");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", usersController.getUsers);

router.get("/:uid", usersController.getUserById);

router.post(
  "/signup",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
    check("role").isIn(["renter", "owner", "admin"]),
  ],
  usersController.signUp
);

router.post("/login", usersController.login);

router.post("/test", (req, res) => res.json(req.body));

// must be authenticated from here
router.use(checkAuth);

router.put("/:uid", usersController.updateUser);

router.get("/:uid/accommodations", accommodationsControllers.getAllByUserId);

module.exports = router;
