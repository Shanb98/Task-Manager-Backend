const mongoose = require("mongoose");

const regularSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "Please add the regular firstname"],
    },
    lastname: {
        type: String,
        required: [true, "Please add the regular lastname"],
    },
    username : {
        type : String,
        required: [true, "Please add the regular username"],
        unique : [true, "Email address is already exsit"]
    },
    email :{
        type : String, 
        required : [true, "Please add a email"],
        unique : [true, "Email address is already exsit"]
    },
    password: {
        type: String,
        required : [true, "please add the regular password"],
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "userId",
    },
}, 
{
    timestamps: true
});

module.exports = mongoose.model("Regular" , regularSchema);