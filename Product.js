const express = require("express");
const { User, User_address, User_payment } = require("./Schema/UserSchema");
const jwt = require("jsonwebtoken");
const {
  Product,
  Product_category,
  Product_inventory,
  Discount,
} = require("./Schema/ProductSchema");
const app = express();

const router = express.Router();

router.post("/getProductDetails", async (req, res) => {
  const productExist = await Product.findById("650f080093df4cfe1b308a75");

  const getCategoryData = await Product_category.findOne({
    id: productExist.category_id,
  });
  const getInventoryData = await Product_inventory.findOne({
    id: productExist.inventory_id,
  });
  const getDiscountData = await Discount.findOne({
    id: productExist.discount_id,
  });

  console.log(getCategoryData);
  console.log(productExist);
  console.log(getInventoryData);
  console.log(getDiscountData);

  res
    .status(200)
    .send({ getCategoryData, getDiscountData, getInventoryData, productExist });
});
module.exports = router;
