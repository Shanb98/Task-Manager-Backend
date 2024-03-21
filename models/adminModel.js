const mongoose = require("mongoose");
const descriptionSchema = mongoose.Schema({
    title: {
      type: String,
    },
    label: {
      type: String,
    },
    id: {
      type: Date,
    },
    description: {
      type: String,
    },
    day: {
      type: Date,
    }
});

const adminSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "Please add the admin firstname"],
    },
    lastname: {
        type: String,
        required: [true, "Please add the admin lastname"],
    },
    username : {
        type : String,
        required: [true, "Please add the admin username"],
        unique : [true, "Email address is already exsit"]
    },
    email :{
        type : String, 
        required : [true, "Please add a email"],
        unique : [true, "Email address is already exsit"]
    },
    password: {
        type: String,
        required : [true, "please add the admin password"],
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "userId",
    },
    description: [descriptionSchema],

}, 
{
    timestamps: true
});

module.exports = mongoose.model("Admin" , adminSchema);