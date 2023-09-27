const express = require("express");
const {
  User,
  User_address,
  User_payment,
  Cart,
  Session,
} = require("./Schema/UserSchema");
const jwt = require("jsonwebtoken");
const {
  Product,
  Product_category,
  Product_inventory,
  Discount,
} = require("./Schema/ProductSchema");
const app = express();

const router = express.Router();

function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
}
router.post("/addtocart", async (req, res) => {
  const token = req.headers.authorization.substring(7);
  // console.log(token);
  // console.log(jwt.verify(token, "mysalt"));

  const { _id } = jwt.verify(token, "mysalt");

  const cart_for_user = await Cart.findOne({
    user_id: _id,
    product_id: req.body.product_id,
  });

  if (cart_for_user) {
    const update_product_quantity = await Cart.findOneAndUpdate(
      { product_id: req.body.product_id },
      { $set: { quantity: cart_for_user.quantity + req.body.quantity } }
    );

    if (update_product_quantity) {
      const cart_items_for_user = await Cart.find({ user_id: _id });

      if (cart_items_for_user) {
        let productPrices = cart_items_for_user.map(async (elem) => {
          return {
            prm: await Product.findById(elem.product_id),
            quant: elem.quantity,
          };
        });

        Promise.all(productPrices).then(async (resp) => {
          let shopping_total = 0;
          resp.forEach((elem) => {
            shopping_total += elem.prm.price * elem.quant;
          });

          console.log(shopping_total);

          const update_shopping_session = await Session.findOneAndUpdate(
            { user_id: _id },
            { $set: { total: shopping_total } }
          );
          if (update_shopping_session) {
            res
              .status(200)
              .send("cart and shopping session updated successfully");
          }
        });
      }
    }
  } else {
    const cart_item = {
      user_id: _id,
      product_id: req.body.product_id,
      quantity: req.body.quantity,
    };

    const new_cart_item = new Cart(cart_item);

    const addedToCart = await new_cart_item.save();
    const cartExist = await Cart.find({ user_id: _id });
    //for a particluar user id there may be many products
    //[{user_id, product_id, quantity},{user_id, product_id, quantity}, {user_id, product_id, quantity}]
    if (cartExist) {
      let total = 0;

      let productsInCart = cartExist.map(async (elem) => {
        return await Product.findById(elem.product_id);
      });

      // console.log(productsInCart);

      Promise.all(productsInCart).then(async (resp) => {
        resp.forEach((elem) => {
          total = total + elem.price;
        });

        console.log("total " + total);
        const shopping_session_exists = await Session.findOne({ user_id: _id });
        if (shopping_session_exists) {
          const update_total = await Session.findOneAndUpdate(
            { user_id: _id },
            { $set: { total: total } }
          );

          if (update_total) {
            res.status(200).send("updated shopping session as well");
          }
        } else {
          const shopping_session = {
            user_id: _id,
            total: total,
          };

          const Session_details = new Session(shopping_session);
          const session_created = await Session_details.save();
          if (addedToCart && session_created) {
            res.status(200).send("data added successfully");
          }
        }
      });
    }

    // let values = cartExist.map(async (elem) => {
    //   return await Product.findById(elem.product_id);
    // });
    // Promise.all(values).then((res) => {
    //   res.forEach((elem) => {
    //     total = total + elem.price;
    //   });
    //   console.log(total);
    // });
  }
});

module.exports = router;
