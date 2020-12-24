const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const { deletePropertyPath } = require("../util/helper");

const accommodationSchema = mongoose.Schema({
  // xã/phường
  ward: { type: String, required: true },
  // quận/huyện
  district: { type: String, required: true },
  // tỉnh/thành phố
  city: { type: String, required: true },
  // địa chỉ cụ thể, VD: 144 Xuân Thủy
  address: { type: String, required: true },
  // Kiểu căn hộ: motel/mini-apartment/apartment/detached-house
  type: {
    type: String,
    enum: ["motel", "mini-apartment", "apartment", "detached-house"],
    required: true,
  },
  number_of_room: {
    // Số phòng
    type: Number,
    required: true,
  },
  price: { type: Number, required: true },
  // Diện tích (m2)
  area: { type: Number, required: true },

  same_owner: { type: Boolean, required: true },

  // Có bình nóng lạnh hay không ?
  has_water_heater: { type: Boolean, required: true, default: true },
  // Có chung chủ hay khép kín ?
  has_private_bathroom: { type: Boolean, required: true, default: true },

  // khu bếp riêng/khu bếp chung/không nấu ăn
  // "private"/"common"/"none"
  kitchen: {
    type: String,
    enum: ["private", "common", "none"],
    required: true,
  },
  // Có điều hòa hay không ?
  has_air_condition: { type: Boolean, required: true },
  // Có ban công hay không ?
  has_balcony: { type: Boolean, required: true },

  description: {
    // Mô tả thêm
    type: String,
  },
  images: [{ type: String, required: true }],
  // Tình trạng phòng hiện tại còn trống hay đã cho thuê. False là còn trống
  is_available: { type: Boolean, required: true, default: true },
  // Phòng trọ đã được duyệt bởi admin, "pending","verified","not_verified"
  status: {
    type: String,
    required: true,
    enum: ["pending", "verified", "not_verified"],
    default: "pending",
  },

  owner: { type: mongoose.Schema.Types.ObjectID, ref: "User", required: true },

  reviews: [
    // Đánh giá của người dùng về nhà trọ
    { type: mongoose.Schema.Types.ObjectID, ref: "Review" },
  ],

  // Số lần bài viết được truy cập
  views: { type: Number, default: 0 },
  // Ngày đăng bài
  publication_date: {
    type: Date,
    required: true,
    default: () => Date.now() + 7 * 24 * 60 * 60 * 1000,
  },

  // Hạn cuối trước khi bài bị ẩn mất
  end_date: {
    type: Date,
    required: true,
    default: () => Date.now() + 30 * 24 * 60 * 60 * 1000,
  },

  // contact info
  name: { type: String, required: true },
  phone: { type: String, required: true },
});

accommodationSchema.statics.protected = [
  "reviews",
  "images",
  "status",
  "owner",
  "views",
];

accommodationSchema.plugin(mongooseLeanVirtuals);

accommodationSchema.statics.safeCreate = function (data, owner) {
  // filter update data for mass assignment
  for (const prop of accommodationSchema.statics.protected) {
    deletePropertyPath(data, prop);
  }

  data.owner = owner.userId;

  data.status = owner.role === "admin" ? "verified" : "pending";

  return this.create(data);
};

accommodationSchema.methods.belongsTo = function (userId) {
  return this.owner.toString() === userId;
};

accommodationSchema.virtual("is_verified").get(function () {
  return this.status === "verified";
});

accommodationSchema.virtual("is_visible").get(function () {
  return this.status === "verified" && Date.now() < this.end_date.getTime();
});

module.exports = mongoose.model("Accommodation", accommodationSchema);
