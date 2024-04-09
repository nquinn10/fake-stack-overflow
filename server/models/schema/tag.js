const mongoose = require("mongoose");

module.exports = mongoose.Schema(
    {
        name: {type: String, required: true}

        // we have taggedQuestionCount in our schema, but we can just do what we did in HW3 to get count
    },
    { collection: "Tag" }
);
