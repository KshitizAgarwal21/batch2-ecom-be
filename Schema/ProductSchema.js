const mongoose = require("mongoose");

const product = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  images: {
    type: Array,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  SKU: {
    type: String,
    required: true,
  },
  category_id: {
    type: Number,
    required: true,
  },
  inventory_id: {
    type: Number,
    required: true,
  },
  discount_id: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const product_category = new mongoose.Schema({
  id: {
    type: Number,
    ref: "Product",
  },
  name: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
});

const product_inventory = new mongoose.Schema({
  id: {
    type: Number,
    ref: "Product",
  },
  quantity: {
    type: Number,
    required: true,
  },
});
const discount = new mongoose.Schema({
  id: {
    type: Number,
    ref: "Product",
  },
  name: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  discount_percent: {
    type: Number,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
});

const Product = mongoose.model("product", product);
const Product_category = mongoose.model("product_category", product_category);
const Product_inventory = mongoose.model(
  "product_inventory",
  product_inventory
);
const Discount = mongoose.model("discount", discount);

module.exports = { Product, Product_category, Product_inventory, Discount };
