const mongoose = require("mongoose");
const {Schema} = require("mongoose");

// Schema for answers
const answerSchema = new mongoose.Schema({
        text: {type: String, required: true},
        ans_by: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        ans_date_time: {type: Date, required: true},
        question: {type: Schema.Types.ObjectId, ref: 'Question', required: true}, // reference to question
        // in our schema, we have an Answer having a vote_count
        vote_count: {type: Number, default: 0},
        flag: {type: Boolean, default: false}

        // we also have update_timestamp, but it looks like Stack Overflow just updates the ask_date_time
    },
    { collection: "Answer" });

answerSchema.index({ ans_by: 1 });

module.exports = answerSchema;