const mongoose = require("mongoose");
const Question = require('../models/questions');
const Answer = require('../models/answers');
const User = require('../models/users');
const { updateVoteCountAndFlag, updateUserReputation } = require('../utils/vote');

const mockSave = jest.fn();
User.prototype.save = mockSave;
jest.mock("../models/questions");
jest.mock("../models/answers");
jest.mock("../models/users");


describe('Question flag updates with vote_count', () => {

    beforeEach(() => {
        jest.resetAllMocks();
        mockSave.mockResolvedValue({});
        Question.findByIdAndUpdate.mockResolvedValue({
            vote_count: -15,
            flag: true,
            save: mockSave  // Use mockSave as the save method
        });
    });

    afterEach(async () => {
        await mongoose.disconnect();  // Disconnect from the database
    });

    it('should flag a question when vote count reaches -15', async () => {
        const result = await updateVoteCountAndFlag(Question, 'questionId', -1, 'Question');

        expect(Question.findByIdAndUpdate).toHaveBeenCalledWith('questionId', { $inc: { vote_count: -1 } }, { new: true });
        expect(mockSave).toHaveBeenCalled();
        expect(result.flag).toBe(true);
    });

    it('should not flag a question if vote count does not reach -15', async () => {
        Question.findByIdAndUpdate.mockResolvedValue({
            vote_count: -14,
            flag: false
        });

        const result = await updateVoteCountAndFlag(Question, 'questionId', 1, 'Question');

        expect(Question.findByIdAndUpdate).toHaveBeenCalledWith('questionId', { $inc: { vote_count: 1 } }, { new: true });
        expect(mockSave).not.toHaveBeenCalled();
        expect(result.flag).toBe(false);
    });
});

describe('Answer flag updates with vote_count', () => {
    
    beforeEach(() => {
        jest.resetAllMocks();
        mockSave.mockResolvedValue({});

        Answer.findByIdAndUpdate.mockResolvedValue({
            vote_count: -15,
            flag: true,
            save: mockSave  // Similarly for Answer
        });
    });

    afterEach(async () => {
        await mongoose.disconnect();  // Disconnect from the database
    });

    it('should flag an answer when vote count reaches -15', async () => {


        const result = await updateVoteCountAndFlag(Answer, 'answerId', -1, 'Answer');

        expect(Answer.findByIdAndUpdate).toHaveBeenCalledWith('answerId', { $inc: { vote_count: -1 } }, { new: true });
        expect(mockSave).toHaveBeenCalled();
        expect(result.flag).toBe(true);
    });

    it('should not flag an answer if vote count does not reach -15', async () => {
        Answer.findByIdAndUpdate.mockResolvedValue({
            vote_count: -10,
            flag: false
        });

        const result = await updateVoteCountAndFlag(Answer, 'answerId', 1, 'Answer');

        expect(Answer.findByIdAndUpdate).toHaveBeenCalledWith('answerId', { $inc: { vote_count: 1 } }, { new: true });
        expect(mockSave).not.toHaveBeenCalled();
        expect(result.flag).toBe(false);
    });
});

describe('Reputation updates on voting', () => {
    let mockUser;

    beforeEach(() => {
        jest.resetAllMocks();
        mockSave.mockResolvedValue({});

        mockUser = {
            _id: 'authorId',
            reputation: 100,
            save: jest.fn(async function() {
                return this; // Simulate saving and returning the updated object
            })
        };

        // Mock findById to return a cloned version of mockUser to simulate database behavior
        User.findById = jest.fn().mockImplementation(id => {
            if (id === 'authorId') {
                return Promise.resolve(mockUser);
            }
            return Promise.resolve(null);
        });
    });

    afterEach(async () => {
        await mongoose.disconnect();  // Disconnect from the database
    });

    it('should increase the poster reputation by 10 on upvote on answer', async () => {
        const item = { asked_by: 'authorId' }; // Simulate answer object
        await updateUserReputation(item, 1, true); // true for upvote

        expect(mockUser.save).toHaveBeenCalled();
        expect(mockUser.reputation).toBe(110); // Check if the reputation is updated correctly
    });

    it('should decrease the poster reputation by 2 on downvote', async () => {
        const item = { asked_by: 'authorId' }; // Simulate a question object
        await updateUserReputation(item, -1, false); // false for downvote

        expect(mockUser.save).toHaveBeenCalled();
        expect(mockUser.reputation).toBe(98); // Check if the reputation is updated correctly
    });
});