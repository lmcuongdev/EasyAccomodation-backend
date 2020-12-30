const { validationResult } = require("express-validator");
const dot = require("dot-object");

const { deletePropertyPath } = require("../util/helper");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const Accommodation = require("../models/accommodation");

module.exports = {
	addView: async (req, res, next) => {
		req.accommodation.views += 1;
		req.accommodation.save();
	},

	getAll: async (req, res, next) => {
		let accommodations;
		try {
			accommodations = await Accommodation.find({}).lean();
		} catch (err) {
			const error = new HttpError(
				"Fetching accommodations failed, please try again later.",
				500
			);
			return next(error);
		}
		res.json({ accommodations });
	},

	getOne: async (req, res, next) => {
		res.json({ accommodation: req.accommodation });
	},

	getAllByUserId: async (req, res, next) => {
		let accommodations;
		try {
			accommodations = await User.getAccommodations(req.params.uid).lean({
				virtuals: true,
			});
		} catch (err) {
			return next(new HttpError("Provided user id not exists", 404));
		}

		res.json({
			accommodations,
		});
	},

	create: async (req, res, next) => {
		const errors = validationResult(req);

		// if validation fails, return error
		if (!errors.isEmpty()) {
			return next(
				new HttpError("Invalid inputs passed, please check your data.", 422)
			);
		}

		const { role } = req.userData;

		// only owner and admin is allowed
		if (role === "renter") {
			return next(new HttpError("You are not allowed", 403));
		}

		// create new accommodation
		let accommod;
		try {
			accommod = await Accommodation.safeCreate(req.body, req.userData);
		} catch (err) {
			return next(new HttpError(err.message, 422));
		}

		res.status(201).json({
			accommodation: accommod,
		});
	},

	update: async (req, res, next) => {
		const { role, userId } = req.userData;
		const isAdmin = role === "admin";

		const accommod = req.accommodation;

		const updatedData = req.body;

		if (!isAdmin) {
			// not allowed to pass
			// if (!accommod.belongsTo(userId) || accommod.is_verified) {
			// 	return next(new HttpError("You are not allowed", 403));
			// }

			// user is owner
			// filter update data for mass assignment if user is owner
			for (const prop of Accommodation.protected) {
				deletePropertyPath(updatedData, prop);
			}
		}
		try {
			console.log(dot.dot({}));
			const updated = await Accommodation.findOneAndUpdate(
				{ _id: accommod.id },
				{
					$set: dot.dot(updatedData),
				},
				{ new: true, useFindAndModify: false }
			);
			res.json({ updated });
		} catch (err) {
			return new HttpError("Cant update user", 401);
		}
	},

	delete: async (req, res, next) => {
		const { role, userId } = req.userData;
		const isAdmin = role === "admin";

		const accommod = req.accommodation;

		if (!accommod.belongsTo(userId) && !isAdmin) {
			return next(new HttpError("You are not allowed", 403));
		}

		try {
			await accommod.remove();
		} catch (err) {
			return next(new HttpError(err.message, 500));
		}

		res.json({ status: "success", message: "Successfully Deleted" });
	},
};
