// unit tests for voting functionality
const supertest = require("supertest");
const mongoose = require("mongoose");
const { server } = require("../server");

const Question = require('../models/questions');
const Vote = require('../models/vote');
const User = require('../models/user');
const Answer = require('../models/answers');

// Mocking the models
jest.mock("../models/questions");
jest.mock("../models/answers");
jest.mock("../models/vote");
jest.mock("../models/user");

jest.mock('connect-mongo', () => ({
    create: () => ({
        get: jest.fn(),
        set: jest.fn(),
        destroy: jest.fn(),
    })
}));

jest.mock('../utils/authMiddleware', () => ({
    authRequired: (req, res, next) => {
        if (req.session && req.session.userId) {
            next();
        } else {
            res.status(401).send("Unauthorized access. Please log in.");
        }
    }
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

const mockAnswer = {
    _id: '65e9b58910afe6e94fc6e6dc',
    text: 'some text',
    vote_count: 0
};
  
// Assuming server exports an HTTP server
const request = supertest(server);

describe('PUT /vote', () => {
    beforeEach(() => {
        jest.resetAllMocks();

        Answer.findByIdAndUpdate = jest.fn((id, update, options) => {
            if (id === '65e9b58910afe6e94fc6e6dc') {
                return Promise.resolve({
                    _id: id,
                    vote_count: mockAnswer.vote_count + (update.$inc.vote_count)  // simulate the database update
                });
            } else {
                return Promise.resolve(null);  // simulate no document found with the given ID
            }
        });
        
    });

    afterEach(async() => {
        if (server && server.close) {
            await server.close();  // Safely close the server
        }
        await mongoose.disconnect(); // Ensure no mongoose handles are left open
    });

    it('should successfully cast a vote if user has enough reputation points', async () => {
       Answer.findById.mockResolvedValue({
            _id: '65e9b58910afe6e94fc6e6dc',
            vote_count: 0
       });

       User.findById.mockResolvedValue({
            _id: 'validUserId',
            reputation: 20
       });

        const mockReqBody = {
            referenceId: '65e9b58910afe6e94fc6e6dc',
            voteType: 'upvote',
            onModel: 'Answer'
        };

        const response = await supertest(server)
            .post('/vote/vote')
            .send(mockReqBody);

        expect(response.status).toBe(201);  // Check for successful vote status
    });

    it('should fail to cast vote if user has too few reputation points', async () => {
        Answer.findById.mockResolvedValue({
            _id: '65e9b58910afe6e94fc6e6dc',
            vote_count: 0
        });

        User.findById.mockResolvedValue({
                _id: 'validUserId',
                reputation: 14
        });

        const mockReqBody = {
            referenceId: '65e9b58910afe6e94fc6e6dc',
            voteType: 'upvote',
            onModel: 'Answer'
        };

        const response = await supertest(server)
            .post('/vote/vote')
            .send(mockReqBody);

        expect(response.status).toBe(403);  // Check for failed vote status
    });

    it('should fail to cast vote if answer/question object nonexistant', async () => {
        Answer.findById.mockResolvedValue(null);

        User.findById.mockResolvedValue({
                _id: 'validUserId',
                reputation: 20
        });

        const mockReqBody = {
            referenceId: '123',
            voteType: 'upvote',
            onModel: 'Answer'
        };

        const response = await supertest(server)
            .post('/vote/vote')
            .send(mockReqBody);

        expect(response.status).toBe(404);  // Check for failed vote status, user already cast same vote
    });

    it('should increment vote_count on an Answer object and return it', async () => {
        const ans = {
            _id: '65e9b58910afe6e94fc6e6dc',
            text: 'some text',
            vote_count: 0  // initial state for the test
        };

        Answer.findById.mockResolvedValue(ans);
        
        const mockPopulatedAnswer = {
            _id: ans._id,
            vote_count: ans.vote_count + 1
        };

        User.findById.mockResolvedValue({
            _id: 'validUserId',
            reputation: 20
        });

        const mockReqBody = {
            referenceId: mockAnswer._id,
            voteType: 'upvote',
            onModel: 'Answer'
        };
    
        const response = await supertest(server)
            .post('/vote/vote')  // Assuming this is the endpoint to vote on an answer
            .send(mockReqBody);  // Sending the vote details

        console.log(response.body);
    
        expect(response.status).toBe(201);  // Status for successful creation/update
        expect(response.body).toEqual(mockPopulatedAnswer);  // The response should match the updated answer
    });
    
    // Additional tests can follow similar structure:
    // - Testing double voting behavior
    // test that after vote is cast, Question.vote_count and/or Answer.vote_count incremented correctly (CYPRESS)
    // test that vote unsuccessful if model=Question but given answerId.
    // test that new Vote object successfully added to the Vote collection in DB
});
