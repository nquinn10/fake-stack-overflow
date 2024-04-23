const supertest = require("supertest")
const { default: mongoose } = require("mongoose");
const Question = require("../models/questions");
const Answer = require('../models/answers');
const { server } = require("../server");
const {addTag} = require("../utils/question");

// Mocking the models
jest.mock('connect-mongo', () => ({
    create: () => ({
        get: jest.fn(),
        set: jest.fn(),
        destroy: jest.fn(),
    })
}));

jest.mock('../models/answers');
jest.mock("../models/questions");
jest.mock('../utils/question', () => ({
    addTag: jest.fn(),
    getQuestionsByOrder: jest.fn(),
    filterQuestionsBySearch: jest.fn(),
}));

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


// ******************************* Test Edit Question *************************************
describe('PUT /editQuestion/:qid', () => {
    beforeEach(() => { 
        // Reset mocks before each test
        jest.resetAllMocks();
    });

    afterEach(async() => {
        if (server && server.close) {
            await server.close(); 
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

        const mockTags = ['tag1', 'tag2', 'tag3'];

        Question.findById.mockResolvedValue({
                                                _id: '65e9b58910afe6e94fc6e6fe',
                                                asked_by: 'validUserId',
                                                title: 'Original Title',
                                                text: 'Original Text',
                                                tags: ['507f191e810c19729de860ea', '65e9a5c2b26199dbcc3e6dc8']
                                            });
        addTag.mockResolvedValueOnce(mockTags);
        Question.findByIdAndUpdate.mockResolvedValue({
                                                         _id: '65e9b58910afe6e94fc6e6fe',
                                                         asked_by: 'validUserId',
                                                         title: 'New Title',
                                                         text: 'Updated Text',
                                                         tags: ['mocked_id_for_tag1', 'mocked_id_for_tag2', 'mocked_id_for_tag3'] 
                                                     });

        const response = await supertest(server)
            .put('/question/editQuestion/65e9b58910afe6e94fc6e6dc')
            .send({ title: 'New Title', text: 'Updated Text', tags: ['tag1', 'tag2', 'tag3']});
            
        expect(response.status).toBe(200);
        expect(response.body.title).toBe('New Title');
        expect(response.body.text).toBe('Updated Text');
        expect(response.body.tags).toEqual(['mocked_id_for_tag1', 'mocked_id_for_tag2', 'mocked_id_for_tag3']);
        expect(addTag).toHaveBeenCalledTimes(3);
        expect(addTag).toHaveBeenCalledWith('tag1');
        expect(addTag).toHaveBeenCalledWith('tag2');
        expect(addTag).toHaveBeenCalledWith('tag3');
    });

});

// ******************************* Test Edit Answer *************************************
describe('PUT /editAnswer/:aid', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.resetAllMocks();
        
    });

    afterEach(async () => {
        if (server && server.close) {
            await server.close();
        }
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

    it('should handle runtime errors while updating answer', async () => {
        const mockAnswer = { _id: 'aid', ans_by: 'validUserId' };
        Answer.findById.mockResolvedValue(mockAnswer);
        
        Answer.findByIdAndUpdate.mockRejectedValue(new Error("Database failure"));

        const response = await supertest(server)
            .put('/answer/editAnswer/aid')
            .send({ text: 'Updated text' });

        expect(response.status).toBe(500);
    })
});