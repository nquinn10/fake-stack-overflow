const mongoose = require("mongoose");
const { server } = require("../server");
const Question = require('../models/questions');
const Answer = require('../models/answers');

const { updateVoteCountAndFlag } = require('../utils/vote');

const mockSave = jest.fn();
jest.mock("../models/questions");
jest.mock("../models/answers");

describe('Question flag updates with vote_count', () => {

    beforeEach(() => {
        jest.resetAllMocks();
       // mockSave.mockResolvedValue({});
    });

    afterEach(async () => {
        console.log('Closing the server...');
        if (server && server.close) {
          await server.close();
          console.log('Server closed.');
        }
        console.log('Disconnecting mongoose...');
        await mongoose.disconnect();
        console.log('Mongoose disconnected.');
      });

    it('should flag a question when vote count reaches -15', async () => {
        Question.findByIdAndUpdate.mockResolvedValue({
            vote_count: -15,
            flag: true,
            save: mockSave
        });

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
        //mockSave.mockResolvedValue({});
    });

    afterEach(async () => {
        console.log('Closing the server...');
        if (server && server.close) {
          await server.close();
          console.log('Server closed.');
        }
        console.log('Disconnecting mongoose...');
        await mongoose.disconnect();
        console.log('Mongoose disconnected.');
      });

    it('should flag an answer when vote count reaches -15', async () => {
        Answer.findByIdAndUpdate.mockResolvedValue({
            vote_count: -15,
            flag: true,
            save: mockSave
        });

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