const {Schema} = require("mongoose");
const bcrypt = require('bcryptjs'); // password hashing algorithm

// Schema for users
const userSchema = new Schema({
    first_name: {type: String, required: true},
        last_name: {type: String, required: true},
        email: {type: String, required: true},
        password: {type: String, required: true},
        display_name: {type: String, unique: true},
        about_me: {type: String},
        location: {type: String},
        reputation: {type: Number, default: 0},
        account_creation_date_time: {type: Date, required: true},
        is_moderator: {type: Boolean, required: true},
        
    }, { collection: "User" });

userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    // Hash the password with a salt round of 10
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = userSchema;
