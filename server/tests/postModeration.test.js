const supertest = require("supertest");
const mongoose = require("mongoose");
const { server } = require("../server");

const User = require('../models/users');
const Answer = require('../models/answers');
const Question = require('../models/questions');

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


jest.mock('../utils/adminMiddleware', () => ({
    adminRequired: (req, res, next) => {
        // Simulating an admin user
        req.user = { id: 'validUserId', is_moderator: true };
        next();
    }
}));


const mockFlaggedQuestions =
    {
        _id: 'question1',
        title: 'title1',
        text: 'text1',
        vote_count: -17,
        flag: true
    };

// ******************************* Test PostMod Get Flagged Content **********************************

// Assuming the endpoint setup and other required imports are correct
describe('GET all content flagged for review', () => {
    beforeEach(() => {
        jest.clearAllMocks(); 
        Question.find.mockClear();
    });

    afterEach(async () => {
        if (server && server.close) {
            await server.close(); 
        }
        await mongoose.disconnect();
    });

    it('should return all questions flagged for review', async () => {
        const mockFlaggedQ = {
            _id: 'question1',
            title: 'title1',
            text: 'text1',
            vote_count: -17,
            flag: true
        };

        const selectMock = jest.fn().mockResolvedValue(mockFlaggedQ);
        const populateMock = jest.fn(() => ({ select: selectMock }));
        Question.find.mockImplementation(() => ({ populate: populateMock }));

        const response = await supertest(server).get('/postModeration/flaggedQuestions');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockFlaggedQuestions);
        expect(Question.find).toHaveBeenCalledWith({ flag: true });
        expect(populateMock).toHaveBeenCalledWith('asked_by');
        expect(selectMock).toHaveBeenCalledWith('title text vote_count');
    });

    it('should return all answers flagged for review', async () => {
        const mockFlaggedAnswers = [
            {
                _id: 'answer1',
                text: 'Some answer text',
                vote_count: -20,
                flag: true,
                ans_by: { _id: 'user1', name: 'User One' },
                question: { _id: 'question1', title: 'Question Title' }
            }
        ];
    
        const selectMock = jest.fn().mockResolvedValue(mockFlaggedAnswers);
        const populateQuestionMock = jest.fn(() => ({ select: selectMock }));
        const populateAnsByMock = jest.fn(() => ({ populate: populateQuestionMock }));
        Answer.find.mockImplementation(() => ({ populate: populateAnsByMock }));
    
        const response = await supertest(server).get('/postModeration/flaggedAnswers');
    
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockFlaggedAnswers);
        expect(Answer.find).toHaveBeenCalledWith({ flag: true });
        expect(populateAnsByMock).toHaveBeenCalledWith('ans_by');
        expect(populateQuestionMock).toHaveBeenCalledWith('question', 'title');
        expect(selectMock).toHaveBeenCalledWith('text vote_count');
    });

    it('should return an empty array when no questions are flagged for review', async () => {
        const selectMock = jest.fn().mockResolvedValue([]);
        const populateMock = jest.fn(() => ({ select: selectMock }));
        Question.find.mockImplementation(() => ({ populate: populateMock }));
    
        const response = await supertest(server).get('/postModeration/flaggedQuestions');
    
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
        expect(Question.find).toHaveBeenCalledWith({ flag: true });
        expect(populateMock).toHaveBeenCalledWith('asked_by');
        expect(selectMock).toHaveBeenCalledWith('title text vote_count');
    });
    

    it('should return an empty array when no answers are flagged for review', async () => {
        const selectMock = jest.fn().mockResolvedValue([]);
        const populateQuestionMock = jest.fn(() => ({ select: selectMock }));
        const populateAnsByMock = jest.fn(() => ({ populate: populateQuestionMock }));
        Answer.find.mockImplementation(() => ({ populate: populateAnsByMock }));
    
        const response = await supertest(server).get('/postModeration/flaggedAnswers');
    
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
        expect(Answer.find).toHaveBeenCalledWith({ flag: true });
        expect(populateAnsByMock).toHaveBeenCalledWith('ans_by');
        expect(populateQuestionMock).toHaveBeenCalledWith('question', 'title');
        expect(selectMock).toHaveBeenCalledWith('text vote_count');
    });


    it('should handle database errors during fetching questions', async () => {
        Question.find.mockImplementation(() => {
            throw new Error("Database error");
        });

        const response = await supertest(server).get('/postModeration/flaggedQuestions');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    })

    it('should handle database errors during fetching answers', async () => {
        Answer.find.mockImplementation(() => {
            throw new Error("Database error");
        });

        const response = await supertest(server).get('/postModeration/flaggedAnswers');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    })

});


// ******************************* Test PostMod Reset flag/vote_count ********************************

describe('PUT /resetQuestion/:qid', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(async () => {
        if (server && server.close) {
            await server.close(); 
        }
        await mongoose.disconnect();
    });

    it('should reset a question flag and vote count', async () => {
        const mockUpdatedQuestion = {
            _id: '123',
            title: 'Updated Question',
            text: 'Updated text',
            vote_count: 0,
            flag: false
        };
    

        Question.findByIdAndUpdate.mockResolvedValue(mockUpdatedQuestion);
    
        const response = await supertest(server).put('/postModeration/resetQuestion/123');
    
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUpdatedQuestion);
        expect(Question.findByIdAndUpdate).toHaveBeenCalledWith(
            '123', 
            { $set: { flag: false, vote_count: 0 } }, 
            { new: true, select: 'title text vote_count' }
        );
    });

    it('should return 404 if no question is found', async () => {
        Question.findByIdAndUpdate.mockResolvedValue(null);

        const response = await supertest(server).put('/postModeration/resetQuestion/456');

        expect(response.status).toBe(404);
        expect(response.body.message).toEqual("Question not found");
    });

    it('should handle runtime errors during reset question', async () => {
        const mockQuestion = {
            _id: '123',
            title: 'Question',
            text: 'text',
            vote_count: -16,
            flag: true
        };
        
        Question.findByIdAndUpdate.mockImplementation(() => {
            throw new Error("Runtime error");
        });

        const response = await supertest(server).put('/postModeration/resetQuestion/123');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    })

});

describe('PUT /resetAnswer/:aid', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(async () => {
        if (server && server.close) {
            await server.close(); 
        }
        await mongoose.disconnect(); 
    });

    it('should reset a question flag and vote count', async () => {
        const mockUpdatedAnswer = {
            _id: '123',
            text: 'Updated Answer',
            vote_count: 0,
            flag: false
        };

        Answer.findByIdAndUpdate.mockResolvedValue(mockUpdatedAnswer);
    
        const response = await supertest(server).put('/postModeration/resetAnswer/123');
    
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUpdatedAnswer);
        expect(Answer.findByIdAndUpdate).toHaveBeenCalledWith(
            '123', 
            { $set: { flag: false, vote_count: 0 } }, 
            { new: true, select: 'text vote_count' }
        );
    });

    it('should return 404 if no answer is found', async () => {
        Answer.findByIdAndUpdate.mockResolvedValue(null);

        const response = await supertest(server).put('/postModeration/resetAnswer/456');

        expect(response.status).toBe(404);
        expect(response.body.message).toEqual("Answer not found");
    });

    it('should handle runtime errors during reset answer', async () => {
        const mockAnswer = {
            _id: '123',
            title: 'Answer',
            text: 'text',
            vote_count: -16,
            flag: true
        };
        
        Answer.findByIdAndUpdate.mockImplementation(() => {
            throw new Error("Runtime error");
        });

        const response = await supertest(server).put('/postModeration/resetAnswer/123');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    })

});

// ******************************* Test PostMod Delete Question/Answer *************************************


describe('DELETE /deleteQuestion/:qid', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Question.findById.mockReset();
        Question.findByIdAndDelete.mockReset();
        Answer.deleteMany.mockReset();
    });

    afterEach(async() => {
        if (server && server.close) {
            await server.close();  
        }
        await mongoose.disconnect(); 
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

    it('should handle runtime errors during delete question', async () => {
        Question.findById.mockResolvedValue({
            _id: '123',
            flag: true // Ensure the flag check passes
        });
        Question.deleteOne.mockImplementation(() => {
            throw new Error("Runtime error");
        });
    
        const response = await supertest(server).delete('/postModeration/deleteQuestion/123');
    
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    });
    
    it('should handle runtime errors during delete answer', async () => {
        Answer.findById.mockResolvedValue({
            _id: '123',
            flag: true // Ensure the flag check passes
        });
        Answer.deleteOne.mockImplementation(() => {
            throw new Error("Runtime error");
        });
    
        const response = await supertest(server).delete('/postModeration/deleteAnswer/123');
    
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    });

});