const mongoose = require("mongoose");
const {Schema} = require("mongoose");

// Schema for questions
const questionSchema = new mongoose.Schema({
        title: {type: String, required: true},
        text: {type: String, required: true},
        asked_by: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        ask_date_time: {type: Date, required: true},
        views: {type: Number, default: 0},
        answers: [{type: Schema.Types.ObjectId, ref: 'Answer'}],
        tags: [{type: Schema.Types.ObjectId, ref: 'Tag', required: true}],
        vote_count: {type: Number, default: 0},
        flag: {type: Boolean, default: false}
    },
    { collection: "Question" });

questionSchema.index({ asked_by: 1 }); // Index on the 'asked_by' field

module.exports = questionSchema;