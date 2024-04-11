const mongoose = require("mongoose");
const {Schema} = require("mongoose");

// Schema for answers
module.exports = mongoose.Schema(
    {
        text: {type: String, required: true},
        //ans_by: {type: String, required: true}, // do we want to keep this as a String, or do we want to reference a User?
        ans_by: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        ans_date_time: {type: Date, required: true},

        // in our schema, we have an Answer having a vote_count
        vote_count: {type: Number, default: 0},
        flag: {type: Boolean, default: false}

        // we also have update_timestamp, but it looks like Stack Overflow just updates the ask_date_time
    },
    { collection: "Answer" }
);
