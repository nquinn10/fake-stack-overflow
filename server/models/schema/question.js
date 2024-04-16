const mongoose = require("mongoose");
const {Schema} = require("mongoose");

// Schema for questions
const questionSchema = new mongoose.Schema({
        title: {type: String, required: true},
        text: {type: String, required: true},
        // asked_by: {type: String, required: true}, // do we want to keep this as a String, or do we want to reference a User?
        asked_by: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        ask_date_time: {type: Date, required: true},
        views: {type: Number, default: 0},
        answers: [{type: Schema.Types.ObjectId, ref: 'Answer'}],
        tags: [{type: Schema.Types.ObjectId, ref: 'Tag', required: true}],

        // in our schema, we have a Question having a vote_count, not vote object
        vote_count: {type: Number, default: 0},

        // status for Post Moderation purposes
        question_status: {type: String, enum: ['UnderReview', 'Deleted', 'Open', 'Closed'], default: 'Open'},
        flag: {type: Boolean, default: false}
        
        // we also have update_timestamp, but it looks like Stack Overflow just updates the ask_date_time
    },
    { collection: "Question" });

questionSchema.index({ asked_by: 1 }); // Index on the 'asked_by' field

module.exports = questionSchema;