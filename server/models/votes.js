// Vote Document Schema
const mongoose = require("mongoose");

const VoteSchema = require("./schema/vote");

module.exports = mongoose.model("Vote", VoteSchema);