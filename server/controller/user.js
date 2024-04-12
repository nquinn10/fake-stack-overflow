const express = require("express");
const User = require("../models/user");
const session = require('express-session'); // define session

const router = express.Router();

// This file will be the user controller
// Once implemented, this file will define all necessary functions for a user object in the model.
// Functionality of the user controller will cover user registration for the platform, creating and editing
// a profile, and more. 

// Define all endpoint logic (and middleware???) 
// This is where you define the logic for the API endpoints that will be called by the userService

const userLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username: username });
        if (user && user.password === password) {  // In a real app, use a hashed password comparison
            req.session.user = { username: user.username };
            res.send("Logged in successfully!");
        } else {
            res.status(401).send("Invalid credentials");
        }
    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).send("An error occurred while processing your request.");
    }
}


router.post('/login', userLogin);

module.exports = router;