const express = require("express");
const { User, User_address, User_payment } = require("./Schema/UserSchema");
const jwt = require("jsonwebtoken");
const app = express();

const router = express.Router();

router.post("/login", async (req, res) => {
  const userExist = await User.findOne({ username: req.body.username });

  if (userExist) {
    if (userExist.passowrd === req.body.passowrd) {
      //create a jwt and send to FE
      const token = jwt.sign({ _id: userExist._id }, "mysalt");

      res.status(200).send(token);
    } else {
      res.status(401).send("Username or password is incorrect");
    }
  } else {
    res.status(200).send("User does not exist");
  }
});

router.get("/getUserDetails", async (req, res) => {
  const token = req.headers.authorization.substring(7);
  const { _id } = jwt.verify(token, "mysalt");
  console.log(_id);

  const userFound = await User_address.findOne({ user_id: _id });

  if (userFound) {
    res.status(200).send({ result: userFound });
  }
});
router.get("/getUserPaymentDetails", async (req, res) => {
  const token = req.headers.authorization.substring(7);
  const { _id } = jwt.verify(token, "mysalt");
  console.log(_id);

  const userFound = await User_payment.findOne({ user_id: _id });

  if (userFound) {
    res.status(200).send({ result: userFound });
  }
});

router.post("/useraddress", async (req, res) => {
  const token = req.headers.authorization;
  // console.log(token);
  // console.log(jwt.verify(token, "mysalt"));

  const { _id } = jwt.verify(token, "mysalt");

  const userData = {
    user_id: _id,
    address_line1: req.body.address_line1,
    address_line2: req.body.address_line2,
    city: req.body.city,
    pincode: req.body.pincode,
    mobile: req.body.mobile,
  };

  const saveData = new User_address(userData);

  const isAdded = await saveData.save();

  if (isAdded) {
    console.log("added successfully");
  }
});

module.exports = router;
