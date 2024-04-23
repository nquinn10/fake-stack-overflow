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
  
        Question.findByIdAndUpdate.mockResolvedValue(true);
        // simulate successful deletion answer
        Answer.findByIdAndDelete.mockResolvedValue(true);


        const response = await supertest(server)
            .delete('/answer/deleteAnswer/661dc096d916cd1c9d51655a');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Answer has been deleted');
        expect(Question.findByIdAndUpdate).toHaveBeenCalledWith(
            'questionId', 
            { $pull: { answers: '661dc096d916cd1c9d51655a' } }  
        );
    });

    it('should handle runtime errors while deleting answer', async () => {
        const mockAnswer = { _id: 'aid', ans_by: 'validUserId' };
        Answer.findById.mockResolvedValue(mockAnswer);
        
        Answer.findByIdAndDelete.mockRejectedValue(new Error("Database failure"));

        const response = await supertest(server)
            .delete('/answer/deleteAnswer/aid');

        expect(response.status).toBe(500);
    })
});

// ******************************* Test Delete Question ***********************************

describe('DELETE /deleteQuestion/:qid', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        Question.findById.mockReset();
        Question.findByIdAndDelete.mockReset();
        Answer.deleteMany.mockReset();
    });

    afterEach(async () => {
        // Clean up after each test
        if (server && server.close) {
            await server.close();
        }
        await mongoose.disconnect();
    });

    // Test question not found
    it('should return 404 if question not found', async () => {
        Question.findById.mockResolvedValue(null);

        const response = await supertest(server)
            .delete('/question/deleteQuestion/123');

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Question not found');
    });

    // Test unauthorized deletion
    it('should return 403 if user is not the author', async () => {
        Question.findById.mockResolvedValue({
            _id: '65e9b58910afe6e94fc6e6dc',
            asked_by: 'otherUser'
        });

        const response = await supertest(server)
            .delete('/question/deleteQuestion/65e9b58910afe6e94fc6e6dc');

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Unauthorized: You are not the author of this question');
    });

    // Test successful deletion
    it('should delete the question if the user is the author', async () => {
        Question.findById.mockResolvedValue({
            _id: '65e9b58910afe6e94fc6e6dc',
            asked_by: 'validUserId',
            answers: ['answerId1', 'answerId2']
        });

        // Mock successful deletion of the question
        Question.findByIdAndDelete.mockResolvedValue(true);
        // Mock successful deletion of answers
        Answer.deleteMany.mockResolvedValue({ deletedCount: 2 });

        const response = await supertest(server)
            .delete('/question/deleteQuestion/65e9b58910afe6e94fc6e6dc');

        expect(Question.findByIdAndDelete).toHaveBeenCalledWith('65e9b58910afe6e94fc6e6dc');
        expect(Answer.deleteMany).toHaveBeenCalledWith({ question: '65e9b58910afe6e94fc6e6dc' });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Question has been deleted');
    });
});