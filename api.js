const express = require("express");
const login = require("./User");
const product = require("./Product");
const router = express.Router();

router.use("/login", login);
router.use("/product", product);
module.exports = router;
