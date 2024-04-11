// Answer Document Schema
const mongoose = require("mongoose");
const answerSchema = require("./schema/answer");

// Compile schema into a model
const Answer = mongoose.model("Answer", answerSchema);

module.exports = Answer;