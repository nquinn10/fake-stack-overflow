const express = require("express");
const Answer = require("../models/answers");
const Question = require("../models/questions");
//const {addTag} = require("../utils/question");

const router = express.Router();

// Adding answer
const addAnswer = async (req, res) => {
    try {
        // extract answer data from request body
        const { qid, ans } = req.body;

        // create a new answer object
        const newAnswer = await Answer.create(ans);

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

// add appropriate HTTP verbs and their endpoints to the router.
router.post("/addAnswer", addAnswer);

module.exports = router;
