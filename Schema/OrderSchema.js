const mongoose = require("mongoose");

const order_details = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  total: {
    type: Number,
    required: true,
  },

  payment_id: {},
});

const ordered_items = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order_details",
  },

  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },

  quantity: {
    type: Number,
    required: true,
  },
});

const Order_details = mongoose.model("order_detail", order_details);
const Ordered_items = mongoose.model("ordered_items", ordered_items);

module.exports = { Order_details, Ordered_items };
