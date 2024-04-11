const mongoose = require("mongoose");
const {Schema} = require("mongoose");

// Schema for vote

const voteSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    referenceId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'onModel'
    },
    onModel: {
        type: String,
        required: true,
        enum: ['Question', 'Answer']
    },
    voteType: {
        type: String,
        required: true,
        enum: ['upvote', 'downvote']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { collection: "Vote" }); // The timestamps option adds createdAt and updatedAt fields
    
// Creating an index to ensure a user can only vote once per question or answer
voteSchema.index({ user: 1, referenceId: 1, onModel: 1 }, { unique: true });

module.exports = voteSchema;