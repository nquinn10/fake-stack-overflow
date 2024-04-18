const express = require("express");
const mongoose = require("mongoose");

const Question = require('../models/questions');
const Answer = require('../models/answers');

const { deleteQuestion } = require('./question');
const { deleteAnswer } = require('./answer');
const { authRequired } = require("../utils/authMiddleware"); // import middleware for authenticating user
const { adminRequired } = require("../utils/adminMiddleware");

const router = express.Router();

// Get all questions where flag === true
const getFlaggedQuestions = async (req, res) => {
    try {
        const flaggedQuestions = await Question.find({ flag: true })
            .populate('asked_by')
            .select('title text vote_count'); // add/remove fields to be returned as necessary

        res.status(200).json(flaggedQuestions);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all flagged answers
const getFlaggedAnswers = async (req, res) => {
    try {
        const flaggedAnswers = await Answer.find({ flag: true })
            .populate('ans_by', 'username')
            .populate('question', 'title')
            .select('text vote_count'); // add/remove fields to be returned as necessary

        res.status(200).json(flaggedAnswers);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// reset flagged question
const resetFlaggedQuestion = async (req, res) => {
    const { qid } = req.params; 
    try {
        const updatedQuestion = await Question.findByIdAndUpdate(qid, {
            $set: { flag: false, vote_count: 0 }
        }, { new: true }).select('title text vote_count');
        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json(updatedQuestion);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// reset flagged answer
const resetFlaggedAnswer = async (req, res) => {
    const { aid } = req.params;
    try {
        const updatedAnswer = await Answer.findByIdAndUpdate(aid, {
            $set: { flag: false, vote_count: 0 }
        }, { new: true }).select('text vote_count');

        if (!updatedAnswer) {
            return res.status(404).json({ message: "Answer not found" });
        }

        res.status(200).json(updatedAnswer);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

 

router.get('/flaggedQuestions',authRequired, adminRequired, getFlaggedQuestions); 
router.get('/flaggedAnswers', authRequired, adminRequired, getFlaggedAnswers);
router.put('/resetQuestion/:qid', authRequired, adminRequired, resetFlaggedQuestion);
router.put('/resetAnswer/:aid', authRequired, adminRequired, resetFlaggedAnswer);

module.exports = router;

