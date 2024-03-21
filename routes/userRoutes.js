const express = require("express");
const validateToken = require("../middleware/validateTokenHandler");

const{
    createUser,
    loginUser,
    addDescription
}= require("../controllers/userController");

const router = express.Router();

router.post("/register",createUser);
router.post("/login",loginUser);
router.patch("/update", validateToken, addDescription);
module.exports = router;

