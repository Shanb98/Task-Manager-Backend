const mongoose = require("mongoose");

const userSchema = mongoose.Schema({

    username : {
        type : String,
        required: [true, "Please add the user username"],
        unique : [true, "Email address is already exsit"]
    },
    email :{
        type : String, 
        required : [true, "Please add a email"],
        unique : [true, "Email address is already exsit"]
    },
    password: {
        type: String,
        required : [true, "please add the user password"],
    },
    userRole:{
        type: String,
        required : [true, "please add the user Role"],
    },
    registerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "registerId",
    },
}, 
{
    timestamps: true
});

module.exports = mongoose.model("User" , userSchema);