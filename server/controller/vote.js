const express = require('express');
const router = express.Router();
const Vote = require('../models/votes');  // Ensure you have a model for Vote
const Question = require('../models/questions');  // Assuming model file names
const Answer = require('../models/answers');
const { authRequired } = require("../utils/authMiddleware");
const User = require('../models/users');

/**
 * Function to cast a vote, on either a Question or Answer object.
 * Requires: userID and valid session (authenticated user), reputation score >= 15.
 */
const castVote = async (req, res) => {
    const { referenceId, voteType, onModel } = req.body; // vote details in req.body
    const userId = req.session.userId; // get userId stored in session

    if (!userId) {
        return res.status(401).send("Authentication required to vote.");
    } 

    try {
        // Retrieve user from the database to check reputation
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found.");
        }

        // check that the user has enough reputation points to vote. (User.reputation must be >= 15)
        if (user.reputation < 15) {
            return res.status(403).send("You don't have enough reputation points to cast a vote. Try answering more questions and engaging with the community to build up your points!");
        }

        // verify that the referenced question or answer exists
        const Model = onModel === 'Question' ? Question : Answer;
        const item = await Model.findById(referenceId);
        if (!item) {
            return res.status(404).send(`${onModel} not found.`);
        }
        
        // ensure user not voting on the same object twice
        const existingVote = await Vote.findOne( {user: userId, referenceId, onModel });
        // if user previously upvoted but wants to downvote or vice versa
        if (existingVote) {
            if (existingVote.voteType !== voteType) { 
                // update existing vote
                existingVote.voteType = voteType;
                await existingVote.save();
    
                // Adjust vote counts: subtract one vote of the old type and add one of the new type
                const voteChange = (voteType === 'upvote') ? 2 : -2;
                await Model.findByIdAndUpdate(referenceId, { $inc: { vote_count: voteChange } });
    
                return res.status(200).send("Vote updated successfully");
            } else {
                return res.status(409).send("You have already given the same vote on this " + onModel.toLowerCase() + ".");
            }
        }
    
        // create and save new Vote
        const newVote = new Vote({
            user: userId,
            referenceId, 
            onModel, 
            voteType,
            createdAt: new Date() // not technically needed, default set in schema
        });

        await newVote.save();

        // update vote count on question/answer
        const voteIncrement = voteType === 'upvote' ? 1 : -1;
        await Model.findByIdAndUpdate(referenceId, { $inc: { vote_count: voteIncrement } });

        res.status(201).send("Vote successfully cast.");
    } catch (error) {
        console.error("Error casting vote: ", error);
        res.status(500).send("An error occurred while casting vote.");
    }
};

// define routes
router.post('/', authRequired, castVote);

module.exports = router;
