// unit tests for voting functionality
const supertest = require("supertest");
const mongoose = require("mongoose");
const { server } = require("../server");

const Question = require('../models/questions');
const Vote = require('../models/votes');
const User = require('../models/users');
const Answer = require('../models/answers');


// Mocking the models
jest.mock("../models/questions");
jest.mock("../models/answers");
jest.mock("../models/votes");
jest.mock("../models/users");

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
jest.mock('../utils/vote', () => ({
    updateVoteCountAndFlag: jest.fn(),
    updateUserReputation: jest.fn()
}));

// ******************************* Testing Vote Functionality ***********************************

describe('PUT /vote', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        // Mock for User.findById for voting user and author of post
        User.findById.mockImplementation(userId => {
            if (userId === 'validUserId') {
                return Promise.resolve({
                                           _id: userId,
                                           reputation: 20,
                                           save: jest.fn() 
                                       });
            } else if (userId === 'authorId') {
                // Mock for the author's user object
                return Promise.resolve({
                                           _id: userId,
                                           reputation: 100,
                                           save: jest.fn() 
                                       });
            }
            return Promise.resolve(null);
        });

        Question.findById.mockResolvedValue({ _id: 'validQuestionId', vote_count: 5, asked_by: 'authorId' });
        Answer.findById.mockResolvedValue({ _id: 'validAnswerId', vote_count: 3, ans_by: 'authorId' });

        Vote.findOne.mockResolvedValue(null);

        require('../utils/vote').updateVoteCountAndFlag.mockResolvedValue({ _id: 'validAnswerId', vote_count: 4 });
        require('../utils/vote').updateUserReputation.mockResolvedValue();

    });

    afterEach(async() => {
        if (server && server.close) {
            await server.close(); 
        }
        await mongoose.disconnect(); 
    });

    it('should successfully cast a vote if user has enough reputation points', async () => {

        const expectedUpdatedItem = {
            _id: 'validAnswerId',
            vote_count: 4,
            ans_by: 'authorId'
        };
        require('../utils/vote').updateVoteCountAndFlag.mockResolvedValue(expectedUpdatedItem);

        const response = await supertest(server).post('/vote/vote').send({
                                                                        referenceId: 'validAnswerId',
                                                                        voteType: 'upvote',
                                                                        onModel: 'Answer'
                                                                    });

        expect(response.status).toBe(201);
        expect(Vote.findOne).toHaveBeenCalled();
        expect(require('../utils/vote').updateVoteCountAndFlag).toHaveBeenCalledWith(
            Answer, 'validAnswerId', 1, 'Answer'
        );
        expect(require('../utils/vote').updateUserReputation).toHaveBeenCalledWith(
            expect.objectContaining({ _id: 'validAnswerId', ans_by: 'authorId' }), 1, true
        );
        expect(response.body).toEqual(expectedUpdatedItem);
    });

    it('should fail to cast vote if user has too few reputation points', async () => {
        User.findById.mockResolvedValue({ _id: 'validUserId', reputation: 10 });

        const response = await supertest(server).post('/vote/vote').send({
                                                                             referenceId: 'validQuestionId',
                                                                             voteType: 'upvote',
                                                                             onModel: 'Question'
                                                                         });

        expect(response.status).toBe(403);
        expect(response.text).toBe("Insufficient reputation to cast a vote.");
    });

    it('should fail to cast vote if answer/question object non-existent', async () => {
        Question.findById.mockResolvedValue(null);

        const response = await supertest(server).post('/vote/vote').send({
                                                                             referenceId: 'nonExistentId',
                                                                             voteType: 'upvote',
                                                                             onModel: 'Question'
                                                                         });

        expect(response.status).toBe(404);
        expect(response.text).toBe("Question not found.");
    });

    it('should increment vote_count on a Question object and return it', async () => {
        const expectedUpdatedItem = { _id: 'validQuestionId', vote_count: 6, asked_by: 'authorId' };
        require('../utils/vote').updateVoteCountAndFlag.mockResolvedValue(expectedUpdatedItem);

        const response = await supertest(server).post('/vote/vote').send({
                                                                             referenceId: 'validQuestionId',
                                                                             voteType: 'upvote',
                                                                             onModel: 'Question'
                                                                         });

        expect(response.status).toBe(201);
        expect(response.body).toEqual(expectedUpdatedItem);
    });

    it('should increase the poster reputation by 10 on upvote', async () => {
        const mockUser = {
            _id: 'authorId',
            reputation: 100,
            save: jest.fn().mockResolvedValue()
        };
        User.findById.mockResolvedValue(mockUser);


        require('../utils/vote').updateUserReputation.mockImplementation(async (item, change, isUpvote) => {
            if (isUpvote) {
                const user = await User.findById(item.asked_by);
                user.reputation += 10;
                await user.save();
                return user;
            }
        });

        await supertest(server).post('/vote/vote').send({
                                                            referenceId: 'validQuestionId',
                                                            voteType: 'upvote',
                                                            onModel: 'Question'
                                                        });

        expect(mockUser.save).toHaveBeenCalled();
        expect(mockUser.reputation).toBe(110);
        expect(require('../utils/vote').updateUserReputation).toHaveBeenCalled();
        expect(User.findById).toHaveBeenCalledWith('authorId');
    });

    it('Should not let user cast the same vote twice', async () => {
        const mockUser = {
            _id: 'authorId',
            reputation: 100,
            save: jest.fn().mockResolvedValue()
        };

        const mockVote = {
            referenceId: '123',
            voteType: 'downvote',
            onModel: 'Question'
        };

        User.findById.mockResolvedValue(mockUser);
        Question.findById.mockResolvedValue({ _id: '123' })
        Vote.findOne.mockResolvedValue(mockVote);

        const response = await supertest(server).post('/vote/vote').send({
            referenceIsd: '123',
            voteType: 'downvote',
            onModel: 'Question'
        });

        expect(response.status).toBe(409);
        expect(response.body.message).toBe("You have already cast this vote.");
        expect(Vote.prototype.save).not.toHaveBeenCalled();
    })

    it('should deny voting if user not found', async () => {
        User.findById.mockResolvedValue(null);

        const response = await supertest(server).post('/vote').send({
            referenceId: '123',
            voteType: 'upvote',
            onModel: 'Question'
        });

        expect(response.status).toBe(404);
    })

    it('should handle runtime errors when casting vote', async () => {
        User.findById.mockResolvedValue({ _id: 'validId', reputation: 25 });
        Question.findById.mockRejectedValue(new Error("Database failure"));

        const response = await supertest(server).post('/vote/vote').send({
            referenceId: '123',
            voteType: 'upvote',
            onModel: 'Question'
        });

        expect(response.status).toBe(500);
    })

    it('should allow user to change their vote type', async () => {
        const mockUser = {
            _id: 'authorId',
            reputation: 100,
            save: jest.fn().mockResolvedValue()
        };

        const mockVote = {
            referenceId: '123',
            voteType: 'downvote',
            onModel: 'Question',
            save: jest.fn().mockResolvedValue()
        };

        User.findById.mockResolvedValue(mockUser);
        Question.findById.mockResolvedValue({ _id: '123' })
        Vote.findOne.mockResolvedValue(mockVote);

        const response = await supertest(server).post('/vote/vote').send({
            referenceId: '123',
            voteType: 'upvote',
            onModel: 'Question'
        });

        expect(response.status).toBe(201);
    })

});
