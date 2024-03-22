const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const Regular = require("../models/regularModel");
const MasterDesc = require("../models/masterDesc");
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

    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400);
      throw new Error("All fields are mandatory!");
    }

    const user = await User.findOne({ username });
    console.log(user);

    
    // Check if the user exists
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

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
    console.error(error);
    res.status(500).json({ message: "Invalid Login Details. Please try again!" });
  }
});

const addDescription = asyncHandler(async (req, res) => {
  try {
    // Fetching the email and password from the body
    const { title, label, id, description, day } = req.body;
    if (!title || !label || !id || !description || !day) {
      res.status(400);
      throw new Error("All fields are mandatory!");
    }
  
    // Create a new description entry
    const desc = await MasterDesc.create({
      title: req.user.username + " - " + title,
      label,
      id,
      description,
      day,
      userId: req.user.registerId,
      descId: null
    });

    let user;

    if (req.user.userRole === "Admin") {
      user = await Admin.findOne({ _id: req.user.registerId });
    } else if (req.user.userRole === "Regular") {
      user = await Regular.findOne({ _id: req.user.registerId });
    }

    if (!user) {
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

    // Push the new description to the user's description array
    user.description.push(newDescription);
    await user.save();

    // Update the descId of the created description with the _id of the last description in the array
    desc.descId = user.description[user.description.length - 1]._id;
    await desc.save();

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Invalid Login Details. Please try again!" });
  }
});


const getdata = asyncHandler(async (req, res) => {
  if (req.user.userRole === "Admin") {
    try {
      const contacts = await MasterDesc.find(); 
      
      const transformedData = contacts.map(contact => ({
        title: contact.title,
        label: contact.label,
        id: new Date(parseInt(contact.id)).toISOString(), 
        description: contact.description,
        day: new Date(parseInt(contact.day)).toISOString(),
        _id: contact._id
      }));

      res.status(200).json(transformedData);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }else{
    try {
      const userData = await Regular.findOne({ _id: req.user.registerId });
      if (!userData) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const descriptions = userData.description;
      res.status(200).json(descriptions);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }  
});

const getAlldata = asyncHandler(async (req, res) => {
  if (req.user.userRole === "Admin") {
    try {
      const contacts = await MasterDesc.find(); 
      

      const transformedData = contacts.map(contact => ({
        title: contact.title,
        label: contact.label,
        id: contact.id, 
        description: contact.description,
        day: contact.day,
        _id: contact._id
      }));

      res.status(200).json(transformedData);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

const deleteDescription = asyncHandler(async (req, res) => {
  try {
    const { descId } = req.body;
    console.log("Deleting description with ID:", descId);

    if (!descId) {
      res.status(400);
      throw new Error("Description ID is required for deletion!");
    }

    let user;
    if (req.user.userRole === "Admin") {
      user = await Admin.findOne({ _id: req.user.registerId });
    } else if (req.user.userRole === "Regular") {
      user = await Regular.findOne({ _id: req.user.registerId });
    }

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Remove descId from user's description array
    user.description = user.description.filter((id) => id.toString() !== descId);
    console.log("User description after removal:", user.description);

    // Save the updated user
    await user.save();
    console.log("User saved successfully");

    // Delete the corresponding desc object
    const deletedDesc = await MasterDesc.deleteOne({ _id: descId });
    console.log("Deleted description:", deletedDesc);

    if (deletedDesc.deletedCount === 0) {
      // If no document was deleted, return an error
      throw new Error("Description not found or already deleted");
    }

    res.status(200).json({ message: "Description deleted successfully" });
  } catch (error) {
    console.error("Error deleting description:", error);
    res.status(500).json({ message: "Failed to delete description" });
  }
});



module.exports = {
    createUser,
    loginUser,
    addDescription,
    getdata,
    getAlldata,
    deleteDescription
  };