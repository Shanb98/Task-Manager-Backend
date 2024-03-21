const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const Regular = require("../models/regularModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUser = asyncHandler(async (req, res) => {
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
    console.error('Error in createUser:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    //fetching the email and password from the body
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400);
      throw new Error("All fields are mandatory!");
    }

    //taking the email from the req body and finding it from the db
    const user = await User.findOne({ username });
    console.log(user);

    
    // Check if the user exists
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    //comparing the entered password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const accessToken = jwt.sign(
        {
          //payload
          user: {
            username: user.username,
            id: user.id,
            userRole: user.userRole,
            registerId: user.registerId
          },
        },
        //access token secret
        process.env.ACCESS_TOKEN_SECRET,
        //expiration date
        { expiresIn: "15m" }
      );
      console.log(process.env.ACCESS_TOKEN_SECRET);
      res.status(200).json({ accessToken });
    } else {
      res.status(401);
      throw new Error("Invalid password");
    }
  } catch (error) {
    // Handle any errors that occur
    console.error(error);
    res.status(500).json({ message: "Invalid Login Details. Please try again!" });
  }
});

const addDescription = asyncHandler(async (req, res) => {
  try {
    //fetching the email and password from the body
    const { title,label,id,description,day } = req.body;
    if (!title || !label||!id || !description||!day) {
      res.status(400);
      throw new Error("All fields are mandatory!");
    }
    if(req.user.userRole === "Admin"){
      const admin = await Admin.findOne({ _id: req.user.registerId });
      if (!admin) {
        res.status(404);
        throw new Error("User not found");
      }
      const newDescription = {
        title,
        label,
        id,
        description,
        day
      };

    admin.description.push(newDescription);
    await admin.save();
    res.status(200).json({ admin });
    }else if(req.user.userRole === "Regular"){
      const regular = await Regular.findOne({ _id: req.user.registerId });

      if (!regular) {
        res.status(404);
        throw new Error("User not found");
      }
      const newDescription = {
        title,
        label,
        id,
        description,
        day
      };

      regular.description.push(newDescription);
      await regular.save();
      res.status(200).json({ regular });
    }

  } catch (error) {
    // Handle any errors that occur
    console.error(error);
    res.status(500).json({ message: "Invalid Login Details. Please try again!" });
  }

})
module.exports = {
    createUser,
    loginUser,
    addDescription
  };