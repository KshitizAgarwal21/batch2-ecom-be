const mongoose = require("mongoose");

const user = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
});

const user_address = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  address_line1: {
    type: String,
    required: true,
  },
  address_line2: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  pincode: {
    type: Number,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
});

const user_payment = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  payment_type: {
    type: String,
    required: true,
  },
  approved: {
    type: Boolean,
    required: true,
  },
});

const cart_item = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
const shopping_session = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  total: {
    type: Number,
    required: true,
  },
});

const User = mongoose.model("user", user);
const User_address = mongoose.model("user_address", user_address);
const User_payment = mongoose.model("user_payment", user_payment);
const Cart = mongoose.model("cart_item", cart_item);
const Session = mongoose.model("shopping_session", shopping_session);

module.exports = { User, User_address, User_payment, Cart, Session };
