// unit tests for post moderation functionality
const supertest = require("supertest");
const mongoose = require("mongoose");
const { server } = require("../server");

const User = require('../models/users');
const Answer = require('../models/answers');
const Question = require('../models/questions');


// Mocking the models
jest.mock('connect-mongo', () => ({
    create: () => ({
        get: jest.fn(),
        set: jest.fn(),
        destroy: jest.fn(),
    })
}));

jest.mock("../models/questions");
jest.mock('../models/answers');

jest.mock('express-session', () => {
    return () => (req, res, next) => {
        req.session = req.testSession || {
            userId: '66207344b20c040394889db7',
            touch: () => {},
        };
        next();
    };
});

jest.mock('../utils/authMiddleware', () => ({
    authRequired: (req, res, next) => {
        if (req.session && req.session.userId) {
            next();
        } else {
            res.status(401).send("Unauthorized access. Please log in.");
        }
    }
}));


jest.mock('../utils/adminMiddleware', () => ({
    adminRequired: (req, res, next) => {
        // Simulating an admin user
        req.user = { id: '66207344b20c040394889db9', is_moderator: true, reputation: 20 };
        next();
    }
}));


// mock questions with the fields you can alter 
// note: later with post moderation we could alter this function to allow to change the status
const mockQuestion = {
        _id: '65e9b58910afe6e94fc6e6dc',
        vote_count: -14,
        flag: false
};

// ******************************* Test PostMod Reset flag/vote_count *********************************


// ******************************* Test PostMod Get Flagged Content *************************************


// ******************************* Test PostMod Delete Question *************************************


describe('DELETE /deleteQuestion/:qid', () => {
    beforeEach(() => {
        // reset all mocks before each test
        jest.clearAllMocks();
        Question.findById.mockReset();
        Question.findByIdAndDelete.mockReset();
        Answer.deleteMany.mockReset();
    });

    afterEach(async() => {
        if (server && server.close) {
            await server.close();  // Safely close the server
        }
        await mongoose.disconnect(); // Ensure no mongoose handles are left open
    });

    // Test question not found
    it('should return 404 if question not found', async () => {
        Question.findById.mockResolvedValue(null);

        const response = await supertest(server)
            .delete('/postModeration/deleteQuestion/123');

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Question not found');
    });

    // Test question not flagged for review
    it('should return 403 if question not flagged for review', async () => {
        Question.findById.mockResolvedValue({
            _id: '65e9b58910afe6e94fc6e6dc',
            flag: false
        });

        const response = await supertest(server)
            .delete('/postModeration/deleteQuestion/65e9b58910afe6e94fc6e6dc');

        expect(response.status).toBe(403);
        expect(response.body.message).toEqual('This question is not flagged for deletion');
    });

    it('should successfully delete question and answers is user.is_moderator and question flagged', async () => {
        Question.findById.mockResolvedValue({
            _id: '65e9b5a995b6c7045a30d823',
            flag: true
        });
        Question.findByIdAndDelete.mockResolvedValue(true);

        const response = await supertest(server)
            .delete('/postModeration/deleteQuestion/65e9b5a995b6c7045a30d823');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Question successfully deleted');
    });
});