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
const masterDescSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please add the admin firstname"],
    },
    label: {
        type: String,
        required: [true, "Please add the admin lastname"],
    },
    id : {
        type : String,
        required: [true, "Please add the admin username"],
        unique : [true, "Email address is already exsit"]
    },
    description :{
        type : String, 
        required : [true, "Please add a email"],
        unique : [true, "Email address is already exsit"]
    },
    day: {
        type: String,
        required : [true, "please add the admin password"],
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "userId",
    },
    descId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "descId",
    },
}, 
{
    timestamps: true
});

module.exports = mongoose.model("MasterDesc" , masterDescSchema);