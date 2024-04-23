const express = require("express");
const Tag = require("../models/tags");
const Question = require("../models/questions");

const router = express.Router();

const getTagsWithQuestionNumber = async (req, res) => {
    const tags = await Tag.find();
    const questions = await Question.find().populate('tags');

    const tagCounts = {};

    for (const tag of tags) {
        // Populate questions with the current tag
        const questionCount = questions.filter(question => question.tags.some(t => t.name === tag.name)).length;

        // Store the tag name and its corresponding question count
        tagCounts[tag.name] = questionCount;
    }

    const response = Object.entries(tagCounts).map(([name, qcnt]) => ({
        name,
        qcnt,
    }));

    // Respond with the tag names and question counts
    res.status(200).json(response);
};

router.get("/getTagsWithQuestionNumber", getTagsWithQuestionNumber);

module.exports = router;
