const Tag = require("../models/tags");
const Question = require("../models/questions");
//const Answer = require("../models/answers");

const addTag = async (tname) => {
    try {
        // Normalize the tag name to lowercase
        const normalizedTagName = tname.toLowerCase();

        // Search for the tag in the database using the normalized tag name
        const existingTag = await Tag.findOne({ name: normalizedTagName });

        if (existingTag) {
            // If the tag exists, return its ID
            return existingTag._id.toString();
        } else {
            // If the tag does not exist, create a new tag with the normalized name
            const newTag = new Tag({ name: normalizedTagName });
            const savedTag = await newTag.save();
            // Return the ID of the newly created tag
            return savedTag._id.toString();
        }
    } catch (error) {
        console.error("Error adding tag:", error);
        throw error;
    }
};

const getQuestionsByOrder = async (order) => {
    try {
        let questions;

        if (order === 'newest') {
            questions = await Question.find()
                .populate('tags')
                .exec();
            questions.sort((a, b) => {
                if (a.ask_date_time > b.ask_date_time) {
                    return -1; // Return -1 if a's ask date is greater than b's ask date
                } else if (a.ask_date_time < b.ask_date_time) {
                    return 1; // Return 1 if a's ask date is less than b's ask date
                } else {
                    return 0; // Return 0 if ask dates are equal
                }
            });
        } else if (order === 'active') {
            questions = await Question.find()
                .populate('answers')
                .populate('tags')
                .exec();
            questions.forEach((q) => {
                let newestAnswerDate = null;
                if (q.answers && q.answers.length > 0) {
                    q.answers.forEach((a) => {
                        if (a.ans_date_time && (!newestAnswerDate || a.ans_date_time > newestAnswerDate)) {
                            newestAnswerDate = a.ans_date_time;
                        }
                    });
                }
                q.newAnsDate = newestAnswerDate;
            });
            questions.sort((a, b) => {
                if (!a.newAnsDate && !b.newAnsDate) {
                    return b.ask_date_time - a.ask_date_time;
                } else if (!a.newAnsDate) {
                    return 1;
                } else if (!b.newAnsDate) {
                    return -1;
                }
                if (a.newAnsDate.getTime() === b.newAnsDate.getTime()) {
                    return b.ask_date_time - a.ask_date_time;
                }
                return b.newAnsDate - a.newAnsDate;
            });
        } else if (order === 'unanswered') {
            questions = await Question.find()
                .populate('tags')
                .exec();
            questions.sort((a, b) => b.ask_date_time - a.ask_date_time);
            questions = questions.filter((q) => q.answers.length === 0);
        } else {
            throw new Error('Invalid order provided');
        }

        return questions;
    } catch (error) {
        console.error("Error getting questions by order:", error);
        throw error;
    }
};

const filterQuestionsBySearch = (qlist, search) => {
    try {
        if (!search.trim()) {
            // if search term is empty, return all questions
            return qlist;
        }
        const searchTags = search.match(/\[([^\]]+)\]/g) || [];
        const searchKeywords = search.replace(/\[([^\]]+)\]/g, " ").match(/\b\w+\b/g) || [];

        // filter the list of questions based on the search term
        const filteredQuestions = qlist.filter(question => {
            const hasKeyword = searchKeywords.some(keyword =>
                                                       question.title.includes(keyword) || question.text.includes(keyword)
            );

            const hasTag = searchTags.some(tag =>
                                               question.tags.some(questionTag => questionTag.name == tag.slice(1,-1))
            );

            return hasKeyword || hasTag
        });

        return filteredQuestions; // return the filtered questions
    } catch (error) {
        console.error("Error filtering questions by search:", error);
        throw error;
    }
}


module.exports = { addTag, getQuestionsByOrder, filterQuestionsBySearch };