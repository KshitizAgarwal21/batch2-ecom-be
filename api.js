const express = require("express");
const login = require("./User");
const product = require("./Product");
const activity = require("./Activity");
const router = express.Router();

router.use("/login", login);
router.use("/product", product);
router.use("/activity", activity);
module.exports = router;
