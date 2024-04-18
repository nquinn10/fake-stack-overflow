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
}


const getFlaggedContent = async (req, res) => {
    try {
        // fetch all questions where question.flag === true
        const [flaggedQuestions, flaggedAnswers] = await Promise.all([
            Question.find({ flag: true }).populate('asked_by').select('title text vote_count'),
            // for now, don't populate with question, too bulky
            Answer.find({ flag: true }).populate('ans_by', 'question').select('text vote_count')
        ]);

        // combine the results into single object
        const flaggedContent = {
            questions: flaggedQuestions,
            answers: flaggedAnswers
        };

        // return returned result
        res.status(200).json(flaggedContent);
    } catch (error) {
        console.error('Error fetching flagged questions: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

router.get('/flaggedQuestions',authRequired, adminRequired, getFlaggedQuestions); 
router.get('/flaggedAnswers', authRequired, adminRequired, getFlaggedAnswers);

module.exports = router;

