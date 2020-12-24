const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const mongooseHidden = require("mongoose-hidden")();
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },

  password: { type: String, required: true, hide: true },

  name: { type: String, required: true },

  favorites: [{ type: mongoose.Schema.Types.ObjectID, ref: "Accommodation" }],

  // 'renter', 'admin', 'owner'
  role: { type: String, required: true, default: "renter" },

  owner_info: {
    type: {
      is_verified: { type: Boolean, required: true, default: false },
      address: { type: String, required: true },
      citizen_id: { type: String, required: true },
      phone: { type: String, required: true },
      accommodations: [
        {
          type: mongoose.Schema.Types.ObjectID,
          ref: "Accommodation",
        },
      ],
    },
  },
});

userSchema.plugin(uniqueValidator);
userSchema.plugin(mongooseHidden);
userSchema.plugin(mongooseLeanVirtuals);

userSchema.virtual("protected").get(function () {
  if (this.role === "admin") return [];

  const common = ["_id", "email", "favorites", "role"];
  if (this.role === "owner" && !this.owner_info.is_verified) {
    return common.concat([
      "owner_info.is_verified",
      "owner_info.accommodations",
    ]);
  }

  return common.concat("owner_info");
});

module.exports = mongoose.model("User", userSchema);
