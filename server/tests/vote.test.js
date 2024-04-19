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

describe('PUT /vote', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        // Mock for User.findById
        //User.findById.mockResolvedValue({ _id: 'validUserId', reputation: 20 });

        User.findById.mockImplementation(userId => {
            if (userId === 'validUserId') {
                // Return an object with a mocked save method
                return Promise.resolve({
                                           _id: userId,
                                           reputation: 20,
                                           save: jest.fn() // Mock the save function to resolve to itself
                                       });
            } else if (userId === 'authorId') {
                // Mock for the author's user object
                return Promise.resolve({
                                           _id: userId,
                                           reputation: 100, // Starting reputation
                                           save: jest.fn() // Mock the save function to resolve to itself
                                       });
            }
            return Promise.resolve(null);
        });

        // Ensure Model.findById resolves for an existing item
        Question.findById.mockResolvedValue({ _id: 'validQuestionId', vote_count: 5, asked_by: 'authorId' });
        Answer.findById.mockResolvedValue({ _id: 'validAnswerId', vote_count: 3, ans_by: 'authorId' });

        Vote.findOne.mockResolvedValue(null);

        // Setup mock for updateVoteCountAndFlag and updateUserReputation
        require('../utils/vote').updateVoteCountAndFlag.mockResolvedValue({ _id: 'validAnswerId', vote_count: 4 });
        require('../utils/vote').updateUserReputation.mockResolvedValue();

    });

    afterEach(async() => {
        if (server && server.close) {
            await server.close();  // Safely close the server
        }
        await mongoose.disconnect(); // Ensure no mongoose handles are left open
    });

    it('should successfully cast a vote if user has enough reputation points', async () => {

        const expectedUpdatedItem = {
            _id: 'validAnswerId',
            vote_count: 4,
            ans_by: 'authorId'
        };
        // Mock updateVoteCountAndFlag to return the expected item
        require('../utils/vote').updateVoteCountAndFlag.mockResolvedValue(expectedUpdatedItem);

        const response = await supertest(server).post('/vote/vote').send({
                                                                        referenceId: 'validAnswerId',
                                                                        voteType: 'upvote',
                                                                        onModel: 'Answer'
                                                                    });

        console.log("Response Body:", response.body);

        expect(response.status).toBe(201);
        expect(Vote.findOne).toHaveBeenCalled();
        expect(require('../utils/vote').updateVoteCountAndFlag).toHaveBeenCalledWith(
            Answer, 'validAnswerId', 1, 'Answer'
        );
        expect(require('../utils/vote').updateUserReputation).toHaveBeenCalledWith(
            expect.objectContaining({ _id: 'validAnswerId', ans_by: 'authorId' }), 1, true
        );
        // Check if the response body matches the expected updated item
        expect(response.body).toEqual(expectedUpdatedItem);
    });

    it('should fail to cast vote if user has too few reputation points', async () => {
        // Adjust the mocked user reputation to below the threshold
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
        // Ensure the question does not exist
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

        // Assume updateUserReputation is called correctly and alters the database as expected
        expect(mockUser.save).toHaveBeenCalled();
        expect(mockUser.reputation).toBe(110);
        expect(require('../utils/vote').updateUserReputation).toHaveBeenCalled();
        expect(User.findById).toHaveBeenCalledWith('authorId');
    });

});



// describe('PUT /vote', () => {
//     beforeEach(() => {
//         jest.resetAllMocks();
//
//         Answer.findByIdAndUpdate = jest.fn((id, update, options) => {
//             if (id === '65e9b58910afe6e94fc6e6dc') {
//                 return Promise.resolve({
//                     _id: id,
//                     vote_count: mockAnswer.vote_count + (update.$inc.vote_count)  // simulate the database update
//                 });
//             } else {
//                 return Promise.resolve(null);  // simulate no document found with the given ID
//             }
//         });
//
//     });
//
//     afterEach(async() => {
//         if (server && server.close) {
//             await server.close();  // Safely close the server
//         }
//         await mongoose.disconnect(); // Ensure no mongoose handles are left open
//     });
//
//     it('should successfully cast a vote if user has enough reputation points', async () => {
//        Answer.findById.mockResolvedValue({
//             _id: '65e9b58910afe6e94fc6e6dc',
//             vote_count: 0
//        });
//
//        User.findById.mockResolvedValue({
//             _id: 'validUserId',
//             reputation: 20
//        });
//
//         const mockReqBody = {
//             referenceId: '65e9b58910afe6e94fc6e6dc',
//             voteType: 'upvote',
//             onModel: 'Answer'
//         };
//
//         const response = await supertest(server)
//             .post('/vote/vote')
//             .send(mockReqBody);
//
//         expect(response.status).toBe(201);  // Check for successful vote status
//     });
//
//     it('should fail to cast vote if user has too few reputation points', async () => {
//         Answer.findById.mockResolvedValue({
//             _id: '65e9b58910afe6e94fc6e6dc',
//             vote_count: 0
//         });
//
//         User.findById.mockResolvedValue({
//                 _id: 'validUserId',
//                 reputation: 14
//         });
//
//         const mockReqBody = {
//             referenceId: '65e9b58910afe6e94fc6e6dc',
//             voteType: 'upvote',
//             onModel: 'Answer'
//         };
//
//         const response = await supertest(server)
//             .post('/vote/vote')
//             .send(mockReqBody);
//
//         expect(response.status).toBe(403);  // Check for failed vote status
//     });
//
//     it('should fail to cast vote if answer/question object nonexistant', async () => {
//         Answer.findById.mockResolvedValue(null);
//
//         User.findById.mockResolvedValue({
//                 _id: 'validUserId',
//                 reputation: 20
//         });
//
//         const mockReqBody = {
//             referenceId: '123',
//             voteType: 'upvote',
//             onModel: 'Answer'
//         };
//
//         const response = await supertest(server)
//             .post('/vote/vote')
//             .send(mockReqBody);
//
//         expect(response.status).toBe(404);  // Check for failed vote status, user already cast same vote
//     });
//
//     it('should increment vote_count on an Answer object and return it', async () => {
//         const ans = {
//             _id: '65e9b58910afe6e94fc6e6dc',
//             text: 'some text',
//             vote_count: 0  // initial state for the test
//         };
//
//         Answer.findById.mockResolvedValue(ans);
//
//         const mockPopulatedAnswer = {
//             _id: ans._id,
//             vote_count: ans.vote_count + 1
//         };
//
//         User.findById.mockResolvedValue({
//             _id: 'validUserId',
//             reputation: 20
//         });
//
//         const mockReqBody = {
//             referenceId: mockAnswer._id,
//             voteType: 'upvote',
//             onModel: 'Answer'
//         };
//
//         const response = await supertest(server)
//             .post('/vote/vote')  // Assuming this is the endpoint to vote on an answer
//             .send(mockReqBody);  // Sending the vote details
//
//         expect(response.status).toBe(201);  // Status for successful creation/update
//         expect(response.body).toEqual(mockPopulatedAnswer);  // The response should match the updated answer
//     });
//
//     it('should increase the poster reputation by 10 on upvote', async () => {
//         // Set up initial states
//         const answerAuthor = {
//             _id: 'authorId',
//             reputation: 5
//         };
//
//         const answer = {
//             _id: '65e9b58910afe6e94fc6e6dc',
//             ans_by: answerAuthor._id,
//             vote_count: 0
//         };
//
//         // Mocking database responses
//         Answer.findById.mockResolvedValue(answer);
//         User.findById.mockResolvedValue(answerAuthor);
//
//         // Mock update behavior
//         User.findByIdAndUpdate = jest.fn((id, update) => {
//             return Promise.resolve({
//                                        _id: id,
//                                        reputation: answerAuthor.reputation + 10
//                                    });
//         });
//
//         const mockReqBody = {
//             referenceId: answer._id,
//             voteType: 'upvote',
//             onModel: 'Answer'
//         };
//
//         // Perform the request
//         const response = await supertest(server).post('/vote/vote').send(mockReqBody);
//
//         // Assertions
//         expect(response.status).toBe(201);
//         expect(User.findByIdAndUpdate).toHaveBeenCalledWith(answerAuthor._id, {
//             $inc: { reputation: 10 }
//         });
//     });
//
// });
