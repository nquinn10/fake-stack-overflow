const supertest = require("supertest");
const mongoose = require("mongoose");
const { server } = require("../server");
const Answer = require('../models/answers');
const Question = require("../models/questions");



// Mock connect-mongo used for MongoDB session storage in express-session
jest.mock('connect-mongo', () => ({
    create: () => ({
        get: jest.fn(),
        set: jest.fn(),
        destroy: jest.fn(),
    })
}));

jest.mock('../models/answers');
jest.mock('../models/questions');

// Mock express-session to manipulate session directly
jest.mock('express-session', () => {
    return () => (req, res, next) => {
        // Don't set userId to simulate unauthorized access
        req.session = req.testSession || {
            userId: 'validUserId',
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

  const mockAnswer = [
    {
        _id: '661dc096d916cd1c9d51655a',
        ans_by: 'validUserId',
        text: 'Old Text',
        question: "dummyQuestionId1"
    },
    {
        _id: '661dc096d916cd1c9d51655b',
        ans_by: 'otherUserId',
        text: 'Old Text',
        question: "dummyQuestionId2"
    }
];

// ******************************* Test Edit Answer *************************************
describe('PUT /editAnswer/:aid', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.resetAllMocks();
        
    });

    afterEach(async () => {
        // Ensure the server is closed after tests to prevent resource leaking
        if (server && server.close) {
            await server.close();
        }
        // Disconnect from mongoose
        await mongoose.disconnect();
    });

    // ensure valid answer
    it('should return 404 if question not found', async () => {
        Answer.findById.mockResolvedValue(null);

        const response = await supertest(server)
            .put('/answer/editAnswer/123')
            .send({ text: 'New text' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Answer not found');
    });

    // ensure logged in user is author of the answer
    it('should return 403 if user is not the author', async () => {
        Answer.findById.mockResolvedValue({
            _id: '661dc096d916cd1c9d51655a',
            ans_by: 'otherUserId'
        });

        const response = await supertest(server)
            .put('/answer/editAnswer/661dc096d916cd1c9d51655a')
            .send({ text: 'New Text' });

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Unauthorized: You are not the author of this answer');
    });

    // if logged in user is author, and valid answer, successfully delete answer
    it('should update the answer is user is author', async () => {
        Answer.findById.mockResolvedValue({
            _id: '661dc096d916cd1c9d51655a',
            ans_by: 'validUserId',
            text: 'Old Text'
        });

        Answer.findByIdAndUpdate.mockResolvedValue({
            _id: '661dc096d916cd1c9d51655a',
            ans_by: 'validUserId',
            text: 'New Text'
        });

        const response = await supertest(server)
            .put('/answer/editAnswer/661dc096d916cd1c9d51655a')
            .send({ text: 'New Text' });

        expect(response.status).toBe(200);
        expect(response.body.text).toBe('New Text');
    });

    it('should return 404 if answer ID is invalid', async () => {
        const invalidId = 'invalid-id-format';

        const response = await supertest(server)
            .put(`/answer/editAnswer/${invalidId}`)
            .send({ text: 'New text' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Answer not found');
    });
});

// ******************************* Test Delete Answer ***********************************

describe('DELETE /deleteAnswer/:aid', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Answer.findById.mockReset();
        Answer.findByIdAndDelete.mockReset();
        Question.findByIdAndUpdate.mockReset();
    });

    afterEach(async () => {
        if (server && server.close) {
            await server.close();
        }
        await mongoose.disconnect();
    });

    //test answer not found
    it('should return 404 if answer not found', async () => {
        Answer.findById.mockResolvedValue(null);

        const response = await supertest(server)
            .delete('/answer/deleteAnswer/123');

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Answer not found');
    });

    // Test unauthorized deletion
    it('should return 403 if user is not the author', async () => {
        Answer.findById.mockResolvedValue({
            _id: '661dc096d916cd1c9d51655a',
            ans_by: 'otherUserId',
            question: 'questionId'
        });

        const response = await supertest(server)
            .delete('/answer/deleteAnswer/661dc096d916cd1c9d51655a');

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Unauthorized: You are not the author of this answer');
    });

    // Test successful deletion
    it('should delete the answer if the user is the author', async () => {
        Answer.findById.mockResolvedValue({
            _id: '661dc096d916cd1c9d51655a',
            ans_by: 'validUserId',
            question: 'questionId'
        });
        // simulate successful deletion of answer from question
        Question.findByIdAndUpdate.mockResolvedValue(true);
        // simulate successful deletion answer
        Answer.findByIdAndDelete.mockResolvedValue(true);


        const response = await supertest(server)
            .delete('/answer/deleteAnswer/661dc096d916cd1c9d51655a');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Answer has been deleted');
        expect(Question.findByIdAndUpdate).toHaveBeenCalledWith(
            'questionId',  // The ID of the question from the answer
            { $pull: { answers: '661dc096d916cd1c9d51655a' } }  // Command to pull the answer from the question
        );
    });
});
