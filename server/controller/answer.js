const express = require("express");
const Answer = require("../models/answers");
const Question = require("../models/questions");
const { authRequired } = require("../utils/authMiddleware"); // import middleware for authenticating user


const router = express.Router();

// Adding answer
const addAnswer = async (req, res) => {
    try {
        const userId = req.session.userId;
        // extract answer data from request body
        const { qid, ans } = req.body;

        if (!userId) {
            return res.status(401).send("Unauthorized access.");
        }

        // Add qid to the answer details
        const answerDetails = {
            ...ans,
            question: qid  // Ensure the qid is included
        };

        // create a new answer object
        const newAnswer = await Answer.create(answerDetails);

        await Question.findOneAndUpdate(
            { _id: qid },
            { $push: { answers: { $each: [newAnswer._id], $position: 0 } } },
            { new: true}
        );

        res.status(200).json(newAnswer);
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Edit Question
// note: add || condition to author, so 
// if userId = author || userId = admin, then they can edit/delete
const editAnswer = async (req, res) => {

    const { aid } = req.params;
    const userId = req.session.userId; 
    const updateData = req.body;

    try {
        // First, find answer and ensure it exists and was answered by current userId
        const ans = await Answer.findById(aid);

        if (!ans) {
            return res.status(404).json({ error: 'Answer not found' });
        }

        // check if logged in user is author of answer
        if (ans.ans_by.toString() !== userId) {
            return res.status(403).json({ error: 'Unauthorized: You are not the author of this answer'});
        }

        // Update the answer if the user if authorized
        const updatedAnswer = await Answer.findByIdAndUpdate(aid, updateData, { new: true });
        if (!updatedAnswer) {
            return res.status(404).json({ error: 'Unable to update the answer' });
        }

        res.status(200).json(updatedAnswer);

    } catch (error) {
        console.error('Error updating answer: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete answer
const deleteAnswer = async (req, res) => {
    const { aid } = req.params;
    const userId = req.session.userId; // userId from session (must be logged in)

    try {
        // First, find answer and ensure it exists and is asked by current userId stored in session
        const ans = await Answer.findById(aid);

        if (!ans) {
            return res.status(404).json({ error: 'Answer not found' });
        }

        // check if logged in user is the one who asked the answer
        if (ans.ans_by.toString() !== userId) {
            return res.status(403).json({ error: 'Unauthorized: You are not the author of this answer' });
        }
        // If the answer is linked to a question, remove the answer from the question's answers array
        if (ans.question) {
            await Question.findByIdAndUpdate(ans.question, {
                $pull: { answers: aid }
            });
        }

        // Delete the answer if user is authorized
        await Answer.findByIdAndDelete(aid);

        res.status(200).json({ message: 'Answer has been deleted' });
    } catch (error) {
        console.error('Error deleting answer: ', error);
        res.status(500).json({ error: 'Internal service error' });
    }
};

// add appropriate HTTP verbs and their endpoints to the router.
router.post("/addAnswer", authRequired, addAnswer);
router.put("/editAnswer/:aid", authRequired, editAnswer);
router.delete("/deleteAnswer/:aid", authRequired, deleteAnswer);

module.exports = router;
