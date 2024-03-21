const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const Regular = require("../models/regularModel");
const bcrypt = require("bcrypt");

const createuser = asyncHandler(async (req, res) => {
  try {
    const { firstname, lastname, username, email, password,userRole } = req.body;

    if (!username || !email || !password || !userRole || !firstname || !lastname ) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }

    const userAvailable = await User.findOne({ $or: [{ username }, { email }] });
    if (userAvailable) {
        res.status(400);
        throw new Error("User already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword);

    // Create a new user
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        userRole,
        
    });

    if(userRole=="Admin"){
      const admin = await Admin.create({
        firstname,
        lastname,
        username,
        email,
        password: hashedPassword,
        userId: user._id
      });
      user.registerId = admin._id;
      await user.save();
    }else if(userRole=="Regular"){
      const regular = await Regular.create({
        firstname,
        lastname,
        username,
        email,
        password: hashedPassword,
        userId: user._id
      });
      user.registerId = regular._id;
      await user.save();
    }
    console.log(`User created: ${user}`);

    if (user) {
      res.status(201).json({
          _id: user.id,
          username: user.username
      });
    } else {
      res.status(400);
      throw new Error("Admin data not valid");
    }
  } catch (error) {
    console.error('Error in registerAdmin:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = {
    createuser
  };