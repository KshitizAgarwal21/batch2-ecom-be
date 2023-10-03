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
const { Order_details, Ordered_items } = require("./Schema/OrderSchema");
const { default: axios } = require("axios");
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

  //firstly check if for the user, the same product is already in the cart or not
  const cart_for_user = await Cart.findOne({
    user_id: _id,
    product_id: req.body.product_id,
  });
  //if product is already there
  if (cart_for_user) {
    //update the qunatity of that product with new quanity + existing quantity
    const update_product_quantity = await Cart.findOneAndUpdate(
      { product_id: req.body.product_id, user_id: _id },
      { $set: { quantity: cart_for_user.quantity + Number(req.body.quantity) } }
    );
    // check if product qunatity updated, then update the shopping session
    if (update_product_quantity) {
      //find all the products in the cart for that user
      const cart_items_for_user = await Cart.find({ user_id: _id });
      //return me an array with product ids
      if (cart_items_for_user) {
        let productPrices = cart_items_for_user.map(async (elem) => {
          return {
            prm: await Product.findById(elem.product_id),
            quant: elem.quantity,
          };
        });
        // wait for the array of promises to get resolved
        Promise.all(productPrices).then(async (resp) => {
          let shopping_total = 0;
          resp.forEach((elem) => {
            shopping_total += elem.prm.price * elem.quant;
          });
          //calculate the shopping total of all items in cart

          //update the total in shopping session model
          const update_shopping_session = await Session.findOneAndUpdate(
            { user_id: _id },
            { $set: { total: shopping_total } }
          );
          if (update_shopping_session) {
            res.status(200).send({
              msg: "cart and shopping session updated successfully",
              result: resp,
            });
          }
        });
      }
    }
  }
  // if the product is not in the cart
  else {
    const cart_item = {
      user_id: _id,
      product_id: req.body.product_id,
      quantity: Number(req.body.quantity),
    };

    const new_cart_item = new Cart(cart_item);
    //add new product in the cart
    const addedToCart = await new_cart_item.save();
    //once it is saved, find all the products in the cart for this user to get their prices and sum total of them to update in the shopping session
    const cartExist = await Cart.find({ user_id: _id });
    //for a particluar user id there may be many products
    //[{user_id, product_id, quantity},{user_id, product_id, quantity}, {user_id, product_id, quantity}]
    if (cartExist) {
      let total = 0;

      let productsInCart = cartExist.map(async (elem) => {
        return {
          prm: await Product.findById(elem.product_id),
          quant: elem.quantity,
        };
      });

      // console.log(productsInCart);

      Promise.all(productsInCart).then(async (resp) => {
        resp.forEach((elem) => {
          total = total + elem.prm.price * elem.quant;
        });

        // check if shopping session already exist for this user
        const shopping_session_exists = await Session.findOne({ user_id: _id });
        if (shopping_session_exists) {
          const update_total = await Session.findOneAndUpdate(
            { user_id: _id },
            { $set: { total: total } }
          );

          if (update_total) {
            res.status(200).send({
              msg: "updated shopping session as well",
              result: resp,
            });
          }
        }
        //create a new shopping session
        else {
          const shopping_session = {
            user_id: _id,
            total: total,
          };

          const Session_details = new Session(shopping_session);
          const session_created = await Session_details.save();
          if (addedToCart && session_created) {
            res.status(200).send({
              msg: "data added successfully",
              result: resp,
            });
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

router.get("/getCart", async (req, res) => {
  const token = req.headers.authorization.substring(7);
  // console.log(token);
  // console.log(jwt.verify(token, "mysalt"));

  const { _id } = jwt.verify(token, "mysalt");

  const fetchCart = await Cart.find({ user_id: _id });

  if (fetchCart) {
    let productsInCart = fetchCart.map(async (elem) => {
      return {
        prm: await Product.findById(elem.product_id),
        quant: elem.quantity,
      };
    });

    Promise.all(productsInCart).then((resp) => {
      res.status(200).send({ result: resp });
    });
  }
});

router.post("/checkout", async (req, res) => {
  const token = req.headers.authorization.substring(7);
  // console.log(token);
  // console.log(jwt.verify(token, "mysalt"));

  const { _id } = jwt.verify(token, "mysalt");

  // once payment is approved then the below will occur

  const getTotal = await Session.findOne({ user_id: _id });

  if (getTotal && getTotal.total) {
    const fetchCart = await Cart.find({ user_id: _id });

    if (fetchCart) {
      let productsInCart = fetchCart.map(async (elem) => {
        return {
          prm: await Product.findById(elem.product_id),
          quant: elem.quantity,
        };
      });

      Promise.all(productsInCart).then(async (resp) => {
        const order = {
          user_id: _id,
          total: getTotal.total,
        };

        const neworder = new Order_details(order);

        const addedOrder = await neworder.save();
        if (addedOrder) {
          //create order items as well.
          let success = resp.map(async (elem) => {
            const items = {
              order_id: addedOrder._id,
              product_id: elem.prm._id,
              quantity: elem.quant,
            };

            const finalItems = new Ordered_items(items);

            return await finalItems.save();
          });
          Promise.all(success).then(async (respon) => {
            const cleanup = await axios.post(
              "http://localhost:8080/activity/cleanup",
              {},
              {
                headers: {
                  Authorization: "Bearer " + token,
                },
              }
            );

            if (respon && cleanup.status == 200) {
              res.status(200).send("order created successfully");
            }
          });
        }
      });
    }
  }
});

router.post("/cleanup", async (req, res) => {
  const token = req.headers.authorization.substring(7);
  // console.log(token);
  // console.log(jwt.verify(token, "mysalt"));

  const { _id } = jwt.verify(token, "mysalt");

  const cleanup = await Cart.deleteMany({ user_id: _id });

  const deleteSession = await Session.deleteOne({ user_id: _id });

  if (cleanup && deleteSession) {
    res.status(200).send("successfull");
  }
});

module.exports = router;
