const express = require("express");
const validateToken = require("../middleware/validateTokenHandler");

const{
    createUser,
    loginUser,
    addDescription,
    getdata,
    getAlldata,
    deleteDescription
}= require("../controllers/userController");

const router = express.Router();

router.post("/register",createUser);
router.post("/login",loginUser);
router.patch("/update", validateToken, addDescription);
router.get("/getdata",validateToken,getdata)
router.get("/getAlldata",validateToken,getAlldata);
router.delete('/delete',validateToken, deleteDescription);
module.exports = router;

