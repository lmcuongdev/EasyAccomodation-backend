const mongoose = require("mongoose");

const reportSchema = mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectID,
      ref: "User",
      required: true,
    },

    accommodation: {
      type: mongoose.Schema.Types.ObjectID,
      ref: "Accommodation",
      required: true,
    },
    // Kiểu report
    type: {
      // "Not existed" / "Incorrect information" / "other"
      type: String,
      required: true,
    },

    // Nội dung của phần đánh giá
    description: { type: String, default: "" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Report", reportSchema);
