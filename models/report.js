const mongoose = require("mongoose");

const reportSchema = mongoose.Schema({
  renter: {
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
    type: "String",
    default: "Not existed",
  },

  // Nội dung của phần đánh giá
  description: { type: String, default: "" },

  // Ngày mà người dùng đánh giá
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", reportSchema);
