const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  renter: { type: mongoose.Schema.Types.ObjectID, ref: "User", required: true },

  accommodation: {
    type: mongoose.Schema.Types.ObjectID,
    ref: "Accommodation",
    required: true,
  },
  // Nội dung của phần đánh giá
  comment: { type: String, default: "" },
  // Số điểm đánh giá mà người dùng cho. Từ 1 -> 5
  rating: { type: Number, required: true },
  // Ngày mà người dùng đánh giá
  created_at: { type: Date, default: Date.now },
  // Cần chấp thuận review để được hiển thị. False thì chưa
  is_verified: { type: Boolean, require: true, default: false },
});

module.exports = mongoose.model("Review", reviewSchema);
