const express = require("express");
const Question = require("../models/questions");
//const Answer = require("../models/answers");
const { addTag, getQuestionsByOrder, filterQuestionsBySearch } = require('../utils/question');
const { authRequired } = require("../utils/authMiddleware"); // import middleware for authenticating user

const router = express.Router();

// To get Questions by Filter
const getQuestionsByFilter = async (req, res) => {
    try {
        // get order and search params from request query
        const { order, search } = req.query;

        // retrieve questions based on specified order
        const questions = await getQuestionsByOrder(order);

        // if search term provided, filter questions by search term
        const filteredQuestions = search ? filterQuestionsBySearch(questions, search) : questions;

        // send the filtered questions as JSON response
        res.json(filteredQuestions);
    } catch (error) {
        // Handle errors
        console.error("Error getting questions by filter:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// To get Questions by Id
const getQuestionById = async (req, res) => {
    try {
        let { qid } = req.params;
        qid = qid.trim();

        const question = await Question.findOneAndUpdate(
            { _id: qid },
            { $inc: { views: 1 } }, // Increment the 'views' field by 1
            { new: true } // Return the updated document
        ).populate('answers');

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.status(200).json(question);
    } catch (error) {
        console.error('Error fetching question by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// To add Question
const addQuestion = async (req, res) => {
    try {
        // extract question data from request body
        const { title, text, tags, asked_by, ask_date_time } = req.body;

        const tagIds = [];

        for (const tagName of tags) {
            const tagId = await addTag(tagName);
            tagIds.push(tagId);
        }

        // create a new question object
        const newQuestion = new Question({
                                             title,
                                             text,
                                             tags: tagIds,
                                             asked_by,
                                             ask_date_time
                                         });

        // save the new question to the database
        const savedQuestion = await Question.create(newQuestion);

        res.status(200).json(savedQuestion);
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Edit Question
// note: later with post moderation we could alter this function to change the q_status if admin
// note: add || condition to author, so 
// if userId = author || userId = admin, then they can edit/delete
const editQuestion = async (req, res) => {

    const { qid } = req.params;
    const userId = req.session.userId; // user ID from session (must match Question.askedBy reference)
    const updateData = req.body;

    try {
        // First, find question and ensure it exists and is askedBy current userId stored in session
        const question = await Question.findById(qid);

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // check if logged in user is the one who asked the question
        if (question.asked_by.toString() !== userId) {
            return res.status(403).json({ error: 'Unauthorized: You are not the author of this question'});
        }

        // Update the question if the user is authorized
        const updatedQuestion = await Question.findByIdAndUpdate(qid, updateData, { new: true });
        if (!updatedQuestion) {
            return res.status(404).json({ error: 'Unable to update the question' });
        }

        res.status(200).json(updatedQuestion);

    } catch (error) {
        console.error('Error updating question: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete question
// note: later with post moderation we could alter this function to change the q_status/delete if admin
const deleteQuestion = async (req, res) => {
    const { qid } = req.params;
    const userId = req.session.userId; // userId from session (must match Question.askedBy reference)

    try {
        // First, find question and ensure it exists and is asked by current userId stored in session
        const question = await Question.findById(qid);

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // check if logged in user is the one who asked the question
        if (question.asked_by.toString() !== userId) {
            return res.status(403).json({ error: 'Unauthorized: You are not the author of this question' });
        }

        // Delete the question if user is authorized
        await Question.findByIdAndDelete(qid);

        res.status(200).json({ message: 'Question has been deleted' });
        
    } catch (error) {
        console.error('Error deleting question: ', error);
        res.status(500).json({ error: 'Internal service error' });
    }

};

// add appropriate HTTP verbs and their endpoints to the router
router.get("/getQuestion", getQuestionsByFilter);
router.get("/getQuestionById/:qid", getQuestionById);
router.post("/addQuestion", addQuestion); // need to add authRequired middleware here too
router.put("/editQuestion/:qid", authRequired, editQuestion);
router.delete("/deleteQuestion/:qid", authRequired, deleteQuestion);


module.exports = router;
