const supertest = require("supertest")
const { default: mongoose } = require("mongoose");
const Question = require('../models/questions');
const { server, sessionStore } = require("../server");
const { authRequired } = require('../utils/authMiddleware');

// Mocking the models
jest.mock('connect-mongo', () => ({
    create: () => ({
        get: jest.fn(),
        set: jest.fn(),
        destroy: jest.fn(),
    })
}));
jest.mock("../models/questions");
jest.mock('express-session', () => {
    return () => (req, res, next) => {
        req.session = {
            userId: 'validUserId',
            touch: () => {},
        };
        next();
    };
});

jest.mock('../utils/authMiddleware', () => ({
    authRequired: (req, res, next) => {
        req.session = { userId: 'validUserId' };
        next();
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
        jest.clearAllMocks();
        Question.findById.mockReset();
        Question.findByIdAndUpdate.mockReset();
    });

    afterEach(async() => {
        if (server && server.close) {
            await server.close();  // Safely close the server
        }
        if (sessionStore && sessionStore.close) {
            await sessionStore.close();  // Ensure the session store is closed
        }
        await mongoose.disconnect()
    });

    // ensure user logged in (NOT WORKING!!!!!)
    it('should not allow editing if user not logged in', async () => {
        // Spy and mock the implementation of authRequired for this specific test
        jest.spyOn(require('../utils/authMiddleware'), 'authRequired')
            .mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "You must log in to edit your questions" });
            });

        // assume question ID is used for test
        const response = await supertest(server)
            .put('/question/editQuestion/65e9b5a995b6c7045a30d823')
            .send({ title: 'Attempted New Title', text: 'Attempted new text' });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("You must log in to edit your questions");
    });
    
    // ensure valid question
    it('should return 404 if question not found', async () => {
        Question.findById.mockResolvedValue(null);

        const response = await supertest(server)
            .put('/question/editQuestion/123')
            .send({ title: 'New Title', text: 'Updated text' })
            .set('Cookie', `session-token=valid-session-token`);
        
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
            .send({ title: 'New Title', text: 'New Text' })
            .set('Cookie', `session-token=valid-session-token`);

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Unauthorized: You are not the author of this question');
    });

    // if logged in user is the author, and valid, question, successfully edit question
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
            .send({ title: 'New Title', text: 'Updated Text', tags: ['tag1', 'tag2']})
            .set('Cookie', `session-token=valid-session-token`);

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
    });

    afterEach(async () => {
        // Clean up after each test
        if (server && server.close) {
            await server.close();
        }
        if (sessionStore && sessionStore.close) {
            await sessionStore.close();
        }
        await mongoose.disconnect();
    });

    // Test user not logged in
    it('should not allow deletion if user not logged in', async () => {
        jest.spyOn(require('../utils/authMiddleware'), 'authRequired')
            .mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "You must log in to delete your questions" });
            });

        const response = await supertest(server)
            .delete('/question/deleteQuestion/65e9b5a995b6c7045a30d823');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("You must log in to delete your questions");
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
            asked_by: 'validUserId'
        });
        Question.findByIdAndDelete.mockResolvedValue(true);

        const response = await supertest(server)
            .delete('/question/deleteQuestion/65e9b58910afe6e94fc6e6dc');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Question has been deleted');
    });
});

