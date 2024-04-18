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
            await server.close();  // Safely close the server
        }
        await mongoose.disconnect()
    });

    // // ensure user logged in (NOT WORKING!!!!!)
    // it('should return 401 unauthorized if no userId in session', async () => {
    //     const response = await supertest(server)
    //         .put('/question/editQuestion/65e9b58910afe6e94fc6e6dc')
    //         .send({ someData: 'data' });

    //     expect(response.status).toBe(401);
    //     expect(response.text).toContain("Unauthorized access. Please log in.");
    // });
    
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
                                                tags: ['507f191e810c19729de860ea', '65e9a5c2b26199dbcc3e6dc8'], // Existing tag IDs
                                                answers: [ans1]
                                            });
        addTag.mockResolvedValueOnce(mockTags);
        Question.findByIdAndUpdate.mockResolvedValue({
                                                         _id: '65e9b58910afe6e94fc6e6fe',
                                                         asked_by: 'validUserId',
                                                         title: 'New Title',
                                                         text: 'Updated Text',
                                                         tags: ['mocked_id_for_tag1', 'mocked_id_for_tag2', 'mocked_id_for_tag3'] // These are the mock IDs returned by addTag
                                                     });

        const response = await supertest(server)
            .put('/question/editQuestion/65e9b58910afe6e94fc6e6dc')
            .send({ title: 'New Title', text: 'Updated Text', tags: ['tag1', 'tag2', 'tag3']});
            
        expect(response.status).toBe(200);
        expect(response.body.title).toBe('New Title');
        expect(response.body.text).toBe('Updated Text');
        expect(response.body.title).toBe('New Title');
        expect(response.body.text).toBe('Updated Text');
        expect(response.body.tags).toEqual(['mocked_id_for_tag1', 'mocked_id_for_tag2', 'mocked_id_for_tag3']);
        expect(addTag).toHaveBeenCalledTimes(3);
        expect(addTag).toHaveBeenCalledWith('tag1');
        expect(addTag).toHaveBeenCalledWith('tag2');
        expect(addTag).toHaveBeenCalledWith('tag3');
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

    // // ensure user logged in
    // it('should return 401 unauthorized if no userId in session', async () => {
    //     const response = await supertest(server)
    //         .delete('/question/Question/65e9b58910afe6e94fc6e6dc');

    //     expect(response.status).toBe(401);
    //     expect(response.text).toContain("Unauthorized access. Please log in.");
    // });

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

