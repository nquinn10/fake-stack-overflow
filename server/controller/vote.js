const express = require('express');
const router = express.Router();
const Vote = require('../models/votes');  // Ensure you have a model for Vote
const Question = require('../models/questions');  // Assuming model file names
const Answer = require('../models/answers');
const { authRequired } = require("../utils/authMiddleware");
const User = require('../models/users');
const { updateVoteCountAndFlag } = require('../utils/vote');  // import helper functioncomm


/**
 * Function to cast a vote, on either a Question or Answer object.
 * Requires: userID and valid session (authenticated user), reputation score >= 15.
 */
const castVote = async (req, res) => {
    const { referenceId, voteType, onModel } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).send("Authentication required to vote.");
    }

    try {
        const user = await User.findById(userId);
        if (!user || user.reputation < 15) {
            return res.status(403).send("Insufficient reputation to cast a vote.");
        }

        const Model = onModel === 'Question' ? Question : Answer;
        const item = await Model.findById(referenceId);

        if (!item) {
            return res.status(404).send(`${onModel} not found.`);
        }

        // Check for an existing vote
        const existingVote = await Vote.findOne({ user: userId, referenceId, onModel });
        let voteChange = voteType === 'upvote' ? 1 : -1;

        if (existingVote) {
            // User is changing their vote
            if (existingVote.voteType !== voteType) {
                voteChange = voteType === 'upvote' ? 2 : -2;
                existingVote.voteType = voteType;
                await existingVote.save();
            } else {
                // User attempting to repeat the same vote, no update needed
                return res.status(409).send("You have already cast this vote.");
            }
        } else {
            // Create a new vote since one doesn't exist
            const newVote = new Vote({
                user: userId,
                referenceId,
                onModel,
                voteType
            });
            await newVote.save();
        }

        // Update the vote count on the Question or Answer
        const updatedItem = await updateVoteCountAndFlag(Model, referenceId, voteChange, onModel);
        return res.status(201).json(updatedItem); // Return the updated item
    } catch (error) {
        console.error("Error casting vote: ", error);
        res.status(500).send("An error occurred while casting vote.");
    }
};

// define routes
router.post('/vote', authRequired, castVote);

module.exports = router;