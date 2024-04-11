const mongoose = require("mongoose");
const {Schema} = require("mongoose");

// Schema for users
module.exports = mongoose.Schema(
    {
        first_name: {type: String, required: true},
        last_name: {type: String, required: true},
        email: {type: String, required: true},
        hashed_password: {type: String, required: true},
        display_name: {type: String, unique: true},
        about_me: {type: String},
        location: {type: String},
        reputation: {type: Number, default: 0},
        account_creation_date_time: {type: Date, required: true},
        is_moderator: {type: Boolean, required: true},

        // UML also has accountStatus (ENUM: Active, UnderReview, Banned). Not sure we want to keep it
    },
    { collection: "User" }
);
