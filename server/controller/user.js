// This file will be the user controller
// Once implemented, this file will define all necessary functions for a user object in the model.
// Functionality of the user controller will cover user registration for the platform, creating and editing
// a profile, and more. 

const express = require("express");
const User = require("../models/user");
const bcrypt = require('bcryptjs');

const router = express.Router();

const userRegistration = async (req, res) => {
    const { first_name, last_name, email, password, display_name, about_me, location } = req.body;

    try {
        // check if user already exists
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        // create new user if user doesn't exist
        const newUser = new User({
            first_name, 
            last_name, 
            email, 
            password: password, // will be hashed automatically
            display_name, 
            about_me, 
            location, 
            account_creation_date_time: new Date(),
            is_moderator: false
        });

        // save new user
        await newUser.save();
        req.session.userId = newUser._id;  // Start a new session after registering
        
        // send a success response
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred, user not registered');
    }
};

const userLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // console.log(user); // check user object
        if (user && await bcrypt.compare(password, user.password)) {  // In a real app, use a hashed password comparison
            // store session with userID
            req.session.userId = user._id;
            res.send("Logged in successfully!");
        } else {
            res.status(401).send("Invalid credentials");
        }
    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).send("An error occurred while processing your request.");
    }
}

router.post('/register', userRegistration);
router.post('/login', userLogin);

module.exports = router;