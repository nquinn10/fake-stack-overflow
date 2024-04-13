const mongoose = require("mongoose");

// Schema for answers
module.exports = mongoose.Schema(
    {
        text: {type: String, required: true},
        ans_by: {type: String, required: true},
        ans_date_time: {type: Date, required: true}
    },
    { collection: "Answer" }
);
