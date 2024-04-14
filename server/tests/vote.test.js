// unit tests for controller/vote
const supertest = require("supertest");
const { default: mongoose } = require("mongoose");
const Vote = require('../models/vote');
const Question = require('../models/questions');
const Answer = require('../models/answers');
const User = require('../models/user');
const { server, sessionStore } = require("../server");

// mock dependencies 
jest.mock('connect-mongo', () => ({
    create: () => ({
        get: jest.fn(),
        set: jest.fn(),
        destroy: jest.fn(),
    })
}));
jest.mock('../models/user');
jest.mock('express-session', () => {
    return () => (req, res, next) => {
        req.session = {
            userId: '661c4bfa7a744bd3c591926a',
            touch: () => {},
        };
        next();
    };
});
jest.mock('../utils/authMiddleware', () => ({
    authRequired: (req, res, next) => {
        req.session = { userId: '661c4bfa7a744bd3c591926a' };
        next();
    }
}));

const mockQuestion = {
    _id: '65e9b58910afe6e94fc6e6fe',
    vote_count: 0,
    save: jest.fn().mockResolvedValue({}),
};

const mockUser = {
    _id: "661c4bfa7a744bd3c591926a",
    reputation: 20,
};

const mockUserInvalid = {
    _id: "661c4bfa7a744bd3c5919271",
    reputation: 0,
};

// Mock findById to return the mock user or question depending on the input
User.findById = jest.fn().mockImplementation((id) => {
    return id === "661c4bfa7a744bd3c591926a" ? Promise.resolve(mockUser) : Promise.resolve(null);
});

Question.findById = jest.fn().mockImplementation((id) => {
    return id === "65e9b58910afe6e94fc6e6fe" ? Promise.resolve(mockQuestion) : Promise.resolve(null);
});

Vote.prototype.save = jest.fn();

// ***************************** test vote on Question/Answer ***************************************

describe('POST /vote/', () => {
    beforeEach(() => {
    });

    afterEach(async () => {
        // Ensure all connections are closed after tests to prevent open handles
        if (server && server.close) {
            await server.close();
        }
        if (sessionStore && sessionStore.close) {
            await sessionStore.close();
        }
        await mongoose.disconnect();
    });

    // vote successful if user has enough reputation points
    it('should successfully cast the vote if user authenticated and has enough reputation points', async () => {
        User.findById.mockResolvedValue(mockUser);
        Question.findById.mockResolvedValue(mockQuestion);
        Vote.prototype.save.mockResolvedValue({});

        const response = await supertest(server)
            .post('/vote/')
            .send({ userId: '661c4bfa7a744bd3c591926a', referenceId: '65e9b58910afe6e94fc6e6fe', voteType: 'upvote', onModel: 'Question' });

        expect(response.status).toBe(201);
        expect(Vote.prototype.save).toHaveBeenCalled();
    });

    // vote unsuccessful if user doesn't have enough reputation points
    it('should not cast a vote if reputation < 15', async () => {
        User.findById.mockResolvedValue(mockUserInvalid);

        const response = await supertest(server)
            .post('/vote/')
            .send({ userId: '661c4bfa7a744bd3c5919271', referenceId: '65e9b58910afe6e94fc6e6fe', voteType: 'upvote', onModel: 'Question' });

        expect(response.status).toBe(403);
    });

    // if vote successful, Question.vote_count or Answer.vote_count incremented/decremented correctly
    it('should increment Question.vote_count correctly after successful vote', async () => {
        // Specific mock setup for this test
        Question.findByIdAndUpdate = jest.fn().mockImplementation((id, update, options) => {
            if (id === '65e9b58910afe6e94fc6e6fe') {
                return Promise.resolve({ _id: id, vote_count: update.$inc.vote_count + 1 });
            }
            return Promise.resolve(null);
        });
    
        User.findById.mockResolvedValue({ _id: '661c4bfa7a744bd3c591926a', reputation: 20 });
        const response = await supertest(server)
            .post('/vote/')
            .send({ userId: '661c4bfa7a744bd3c591926a', referenceId: '65e9b58910afe6e94fc6e6fe', voteType: 'upvote', onModel: 'Question' });
    
        expect(response.status).toBe(201);
        expect(Question.findByIdAndUpdate).toHaveBeenCalledWith('65e9b58910afe6e94fc6e6fe', { $inc: { vote_count: 1 } }, { new: true });
    });
    

    // return error if Question/Answer object not found or invalud id/object type
    it('should return an error if the question/answer id does not exist', async () => {
        User.findById.mockResolvedValue({ _id: '661c4bfa7a744bd3c591926a', reputation: 20 });
        Question.findById.mockResolvedValue(null);

        const response = await supertest(server)
            .post('/vote/')
            .send({ userId: '661c4bfa7a744bd3c591926a', referenceId: '65e9b58910afe6e94fc6e6pl', voteType: 'downvote', onModel: 'Question' });

        expect(response.status).toBe(404);
    });

    // test that new Vote object added to the database successfully
    it('should add new Vote object to successfully to the database', async () => {
        User.findById.mockResolvedValue({ _id: '661c4bfa7a744bd3c591926a', reputation: 20 });
        Question.findById.mockResolvedValue({ _id: '65e9b58910afe6e94fc6e6fe' });
        Vote.prototype.save.mockImplementation(function () { return this; });

        const response = await supertest(server)
            .post('/vote/')
            .send({ userId: '661c4bfa7a744bd3c591926a', referenceId: '65e9b58910afe6e94fc6e6fe', voteType: 'upvote', onModel: 'Question' });

        expect(response.status).toBe(201);
        expect(Vote.prototype.save).toHaveBeenCalled();
    });
});

// test for successful vote with sufficient reputation points




// test that vote is successful if reputation >= 15
// test that vote unsuccessful if reputation < 15
// test that after vote is cast, Question.vote_count and/or Answer.vote_count incremented correctly
// test that vote unsuccessul if question/answer id doesnt exist
// test that vote unsuccessful if model=Question but given answerId.
// test that new Vote object successfully added to the Vote collection in DB

// NOTE: "vote successfully cast" even if questionId or answerId doesnt exist.
// discovered by first using old qId and then by using userId

// NOTE: Vote objects not being removed from the database when the destroy.js script is executed.

// to do: change to just /vote, not /vote/vote