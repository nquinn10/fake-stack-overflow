// This file will be the user controller
// Once implemented, this file will define all necessary functions for a user object in the model.
// Functionality of the user controller will cover user registration for the platform, creating and editing
// a profile, and more. 

const express = require("express");
const User = require("../models/user");
const bcrypt = require('bcryptjs');
const Question = require("../models/questions");
const Answer = require("../models/answers");
const Vote = require("../models/vote");

const router = express.Router();
const { authRequired } = require("../utils/authMiddleware");

const userRegistration = async (req, res) => {
    const { first_name, last_name, email, password, display_name, about_me, location } = req.body;

    try {
        // check if user already exists
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        // create new user if user doesn't exist
        const newUser = new User({
            first_name, 
            last_name, 
            email, 
            password: password, // will be hashed automatically
            display_name, 
            about_me, 
            location, 
            account_creation_date_time: new Date(),
            is_moderator: false
        });

        // save new user
        await newUser.save();
        req.session.userId = newUser._id;  // Start a new session after registering
        
        // send a success response
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred, user not registered');
    }
};

const userLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // console.log(user); // check user object
        if (user && await bcrypt.compare(password, user.password)) {  // In a real app, use a hashed password comparison
            // store session with userID
            req.session.userId = user._id;
            res.send("Logged in successfully!");
        } else {
            res.status(401).send("Invalid credentials");
        }
    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).send("An error occurred while processing your request.");
    }
};

const userProfileSummary = async (req, res) => {
    try {
        const userId = req.session.userId; // Assumes user ID is stored in the session upon authentication
        if (!userId) {
            return res.status(401).send("Unauthorized access.");
        }

        // Find the user by ID and only return the specified fields
        const user = await User.findById(userId).select('first_name last_name email display_name about_me location reputation');
        if (!user) {
            return res.status(404).send("User not found.");
        }

        // Constructing a profile object to ensure only specified data is sent
        const profileSummary = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            display_name: user.display_name,
            about_me: user.about_me,
            location: user.location,
            reputation: user.reputation
        };

        res.json(profileSummary);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching the user profile.");
    }
};

// Fetch questions posted by the current user
const getUserQuestions = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).send("Unauthorized access.");
        }

        // Find questions where 'asked_by' matches the logged-in user's ID
        const userQuestions = await Question.find({ asked_by: userId })
            .populate('tags', 'name'); // Assuming you might want to show tag name;

        if (!userQuestions.length) {
            return res.status(404).send("No questions found.");
        }

        res.json(userQuestions);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching the questions.");
    }
};

// Fetch answers posted by the current user
const getUserAnswers = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).send("Unauthorized access.");
        }

        // Find answers where 'ans_by' matches the logged-in user's ID
        const userAnswers = await Answer.find({ ans_by: userId })
            .populate();  // Assuming you want to show the question title for each answer

        if (!userAnswers.length) {
            return res.status(404).send("No answers found.");
        }

        res.json(userAnswers);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching the answers.");
    }
};

const getUserTags = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).send("Unauthorized access.");
        }

        // Find questions asked by the user and populate the tags directly
        const userQuestions = await Question.find({ asked_by: userId })
            .populate({
                          path: 'tags',   // Populate the tags array in the question documents
                          select: 'name'  // Only select the name field from the tags documents
                      })
            .select('tags'); // Select only the tags field to minimize the data transfer

        if (!userQuestions.length) {
            return res.status(404).send("No questions or tags found.");
        }

        // Extract unique tag names to avoid duplicates if the same tag is used in multiple questions
        const tagSet = new Set();
        userQuestions.forEach(question => {
            question.tags.forEach(tag => {
                tagSet.add(tag.name);
            });
        });

        const uniqueTags = Array.from(tagSet);

        res.json(uniqueTags);  // Send the unique tags back to the client
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching the tags.");
    }
};

const getUserQuestionVotes = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { voteType } = req.query;

        if (!userId) {
            return res.status(401).send("Unauthorized access.");
        }

        let query = { user: userId, onModel: 'Question' };
        if (voteType) {
            query.voteType = voteType;
        }

        const votes = await Vote.find(query)
            .populate({
                          path: 'referenceId',
                          populate: [
                              {
                                  path: 'tags',
                                  model: 'Tag',
                                  select: 'name'
                              },
                              {
                                  path: 'asked_by',
                                  model: 'User',
                                  select: 'display_name'
                              }
                          ],
                          model: 'Question',
                          select: 'title text asked_by ask_date_time views vote_count'
                      })
            .select('voteType createdAt referenceId');

        if (!votes.length) {
            return res.status(404).send("No question votes found.");
        }

        res.json(votes);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching question votes.");
    }
};

const getUserAnswerVotes = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { voteType } = req.query;

        if (!userId) {
            return res.status(401).send("Unauthorized access.");
        }

        let query = { user: userId, onModel: 'Answer' };
        if (voteType) {
            query.voteType = voteType;
        }

        const votes = await Vote.find(query)
            .populate({
                          path: 'referenceId',
                          populate: [
                              {
                                  path: 'ans_by',
                                  model: 'User',
                                  select: 'display_name'
                              }
                          ],
                          model: 'Answer',
                          select: 'text ans_by ans_date_time vote_count'
                      })
            .select('voteType createdAt referenceId');

        if (!votes.length) {
            return res.status(404).send("No answer votes found.");
        }

        res.json(votes);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching answer votes.");
    }
};

const updateUserProfile = async (req, res) => {
    const userId = req.session.userId;
    const { first_name, last_name, display_name, about_me, location } = req.body;

    if (!userId) {
        return res.status(401).send("Unauthorized access.");
    }

    try {
        const updates = {
            ...(first_name && { first_name }),
            ...(last_name && { last_name }),
            ...(display_name && { display_name }),
            ...(about_me && { about_me }),
            ...(location && { location })
        };

        // Ensure there are updates to apply
        if (Object.keys(updates).length === 0) {
            return res.status(400).send("No updates provided.");
        }

        // Find the user and update their profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true, context: 'query' } // options to return the updated document and run model validators
        );

        if (!updatedUser) {
            return res.status(404).send("User not found.");
        }

        res.json({
                     user: {
                         first_name: updatedUser.first_name,
                         last_name: updatedUser.last_name,
                         display_name: updatedUser.display_name,
                         about_me: updatedUser.about_me,
                         location: updatedUser.location
                     }
                 });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while updating the profile.");
    }
};

router.post('/register', userRegistration);
router.post('/login', userLogin);
router.get('/profile', authRequired, userProfileSummary);
router.get('/my-questions', authRequired, getUserQuestions);
router.get('/my-answers', authRequired, getUserAnswers);
router.get('/my-tags', authRequired, getUserTags);
router.get('/my-question-votes', authRequired, getUserQuestionVotes);
router.get('/my-answer-votes', authRequired, getUserAnswerVotes);
router.patch('/profile', authRequired, updateUserProfile);

module.exports = router;
