const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectID, ref: "User", required: true },

  accommodation: {
    type: mongoose.Schema.Types.ObjectID,
    ref: "Accommodation",
    required: true,
  },
  // Nội dung của phần đánh giá
  comment: { type: String, default: "" },
  // Số điểm đánh giá mà người dùng cho. Từ 1 -> 5
  rating: {
    type: Number,
    enum: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
    required: true,
  },
  // Ngày mà người dùng đánh giá
  created_at: { type: Date, default: Date.now },
  // Cần chấp thuận review để được hiển thị. False thì chưa
  status: {
    type: String,
    require: true,
    enum: ["pending", "verified", "not_verified"],
    default: false,
  },
});

reviewSchema.virtual("is_visible").get(function () {
  return this.status !== "not_verified";
});

module.exports = mongoose.model("Review", reviewSchema);
