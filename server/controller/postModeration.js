const express = require("express");
const Question = require('../models/questions');
const Answer = require('../models/answers');

const { authRequired } = require("../utils/authMiddleware"); 
const { adminRequired } = require("../utils/adminMiddleware");

const router = express.Router();

// Moderator get all flagged questions
const getFlaggedQuestions = async (req, res) => {
    try {
        const flaggedQuestions = await Question.find({ flag: true })
            .populate('asked_by')
            .select('title text vote_count'); 

        res.status(200).json(flaggedQuestions);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Moderator get all flagged answers
const getFlaggedAnswers = async (req, res) => {
    try {
        const flaggedAnswers = await Answer.find({ flag: true })
            .populate('ans_by')
            .populate('question', 'title')
            .select('text vote_count'); 
        res.status(200).json(flaggedAnswers);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Moderator reset vote count and flag on question
const resetFlaggedQuestion = async (req, res) => {
    const { qid } = req.params; 
    try {
        const updatedQuestion = await Question.findByIdAndUpdate(qid, {
            $set: { flag: false, vote_count: 0 }
        }, { new: true, select: 'title text vote_count' });

        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json(updatedQuestion);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Moderator reset vote count and flag on answer
const resetFlaggedAnswer = async (req, res) => {
    const { aid } = req.params;
    try {
        const updatedAnswer = await Answer.findByIdAndUpdate(aid, {
            $set: { flag: false, vote_count: 0 }
        }, { new: true, select: 'text vote_count' });

        if (!updatedAnswer) {
            return res.status(404).json({ message: "Answer not found" });
        }

        res.status(200).json(updatedAnswer);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Moderator delete answer
const deleteQuestion = async (req, res) => {
    const { qid } = req.params;
    try {
        const question = await Question.findById(qid);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        
        // Check if the question is flagged - admin can only delete if post flagged!
        if (!question.flag) {
            return res.status(403).json({ message: 'This question is not flagged for deletion' });
        }

        await Question.deleteOne({ _id: qid });
        res.status(200).json({ message: 'Question successfully deleted' });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Moderator delete answer
const deleteAnswer = async (req, res) => {
    const { aid } = req.params;
    try {
        const answer = await Answer.findById(aid);

        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }
        
        // Check if the answer is flagged - admin can only delete post if flagged!
        if (!answer.flag) {
            return res.status(403).json({ message: 'This answer is not flagged for deletion' });
        }

        await Answer.deleteOne({ _id: aid });
        res.status(200).json({ message: 'Answer successfully deleted' });
    } catch (error) {
        console.error('Error deleting answer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


router.get('/flaggedQuestions',authRequired, adminRequired, getFlaggedQuestions); 
router.get('/flaggedAnswers', authRequired, adminRequired, getFlaggedAnswers);
router.put('/resetQuestion/:qid', authRequired, adminRequired, resetFlaggedQuestion);
router.put('/resetAnswer/:aid', authRequired, adminRequired, resetFlaggedAnswer);
router.delete('/deleteQuestion/:qid', authRequired, adminRequired, deleteQuestion);
router.delete('/deleteAnswer/:aid', authRequired, adminRequired, deleteAnswer);

module.exports = router;

