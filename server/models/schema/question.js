const mongoose = require("mongoose");
const {Schema} = require("mongoose");

// Schema for questions
module.exports = mongoose.Schema(
    {
        title: {type: String, required: true},
        text: {type: String, required: true},
        asked_by: {type: String, required: true},
        ask_date_time: {type: Date, required: true},
        views: {type: Number, default: 0},
        answers: [{type: Schema.Types.ObjectId, ref: 'Answer'}],
        tags: [{type: Schema.Types.ObjectId, ref: 'Tag', required: true}]
    },
    { collection: "Question" }
);