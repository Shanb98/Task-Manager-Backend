const express = require("express");
const{
    createAdmin
}= require("../controllers/adminController");

const router = express.Router();

router.post("/register",createAdmin);

module.exports = router;