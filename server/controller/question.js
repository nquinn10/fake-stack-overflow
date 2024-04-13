const express = require("express");
const Question = require("../models/questions");
//const Answer = require("../models/answers");
const { addTag, getQuestionsByOrder, filterQuestionsBySearch } = require('../utils/question');

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

// add appropriate HTTP verbs and their endpoints to the router
router.get("/getQuestion", getQuestionsByFilter);
router.get("/getQuestionById/:qid", getQuestionById);
router.post("/addQuestion", addQuestion);

module.exports = router;
