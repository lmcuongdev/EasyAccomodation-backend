const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema({
  renter: {
    type: mongoose.Schema.Types.ObjectID,
    ref: "User",
    required: true,
  },

  owner: {
    type: mongoose.Schema.Types.ObjectID,
    ref: "User",
    required: true,
  },

  accommodation: {
    type: mongoose.Schema.Types.ObjectID,
    ref: "Accommodation",
    required: true,
  },
  // Trạng thái hiện tại của giao dịch đã được thực hiện hay chưa? False là chưa
  status: {
    type: Boolean,
    default: false,
  },
  // Ngày giao dịch được thực hiện
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
