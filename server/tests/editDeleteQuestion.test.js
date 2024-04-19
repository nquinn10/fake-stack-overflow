const supertest = require("supertest")
const { default: mongoose } = require("mongoose");
const Question = require('../models/questions');
const Answer = require('../models/answers');
const { server } = require("../server");

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


// mock questions with the fields you can alter 
// note: later with post moderation we could alter this function to allow to change the status
const mockQuestions = [
    {
        _id: '65e9b58910afe6e94fc6e6dc',
        title: 'Question 1 Title',
        text: 'Question 1 Text',
        tags: ['tag1'],
        asked_by: 'validUserId'
    },
    {
        _id: '65e9b5a995b6c7045a30d823',
        title: 'Question 2 Title',
        text: 'Question 2 Text',
        tags: ['tag2'],
        asked_by: 'validUserId'
    }
];

// ******************************* Test Edit Question *************************************
describe('PUT /editQuestion/:qid', () => {
    beforeEach(() => { 
        // Reset mocks before each test
        jest.resetAllMocks();
    });

    afterEach(async() => {
        if (server && server.close) {
            await server.close();  // Safely close the server
        }
        await mongoose.disconnect()
    });
    
    // ensure valid question
    it('should return 404 if question not found', async () => {
        Question.findById.mockResolvedValue(null);

        const response = await supertest(server)
            .put('/question/editQuestion/123')
            .send({ title: 'New Title', text: 'Updated text' });
        
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Question not found');
    });

    // ensure the logged in user is the author of the question
    it('should return 403 if user is not the author', async () => {
        Question.findById.mockResolvedValue({
            _id: '65e9b58910afe6e94fc6e6dc',
            asked_by: 'otherUser',
            title: 'Old Title',
            text: 'Old Text'
        });

        const response = await supertest(server)
            .put('/question/editQuestion/65e9b58910afe6e94fc6e6dc')
            .send({ title: 'New Title', text: 'New Text' });

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Unauthorized: You are not the author of this question');
    });

    // if logged in user is the author, and valid question, successfully edit question
    it('should update the question if the user is author', async () => {
        Question.findById.mockResolvedValue({
            _id: '65e9b58910afe6e94fc6e6dc',
            asked_by: 'validUserId',
            title: 'Old Title',
            text: 'Old Text',
            tags: ['tag1']
        });

        Question.findByIdAndUpdate.mockResolvedValue({
            _id: '65e9b58910afe6e94fc6e6dc',
            asked_by: 'validUserId',
            title: 'New Title',
            text: 'Updated Text',
            tags: ['tag1', 'tag2']
        });

        const response = await supertest(server)
            .put('/question/editQuestion/65e9b58910afe6e94fc6e6dc')
            .send({ title: 'New Title', text: 'Updated Text', tags: ['tag1', 'tag2']});
            
        expect(response.status).toBe(200);
        expect(response.body.title).toBe('New Title');
        expect(response.body.text).toBe('Updated Text');
        expect(response.body.tags).toEqual(['tag1', 'tag2']);
    });

});


// ******************************* Test Delete Question ***********************************

describe('DELETE /deleteQuestion/:qid', () => {
    beforeEach(() => {
        // Reset mocks and spies before each test
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