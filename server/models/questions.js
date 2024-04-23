const mongoose = require("mongoose");
const questionSchema = require("./schema/question");

// Compile schema to model
const Question = mongoose.model("Question", questionSchema);

module.exports = Question;