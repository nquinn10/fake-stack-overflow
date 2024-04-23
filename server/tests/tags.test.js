const supertest = require("supertest")

const Tag = require('../models/tags');
const Question = require('../models/questions');
const { default: mongoose } = require("mongoose");
const { server } = require("../server");

jest.mock('connect-mongo', () => ({
    create: () => ({
        get: jest.fn(),
        set: jest.fn(),
        destroy: jest.fn(),
    })
}));

jest.mock('express-session', () => {
    return () => (req, res, next) => {
        req.session = {
            userId: 'validUserId',
            touch: () => {},
        };
        next();
    };
});

const mockTags = [
    { name: 'tag1' },
    { name: 'tag2' },
    { name: 'tag3' },
];

const mockQuestions = [
    { tags: [mockTags[0], mockTags[1]] },
    { tags: [mockTags[0]] },
]

describe('GET /getTagsWithQuestionNumber', () => {

    beforeEach(() => {
    })
    afterEach(async() => {
        if (server && server.close) {
            await server.close();  
        }
        await mongoose.disconnect()
    });

    it('should return tags with question numbers', async () => {
        Tag.find = jest.fn().mockResolvedValueOnce(mockTags);

        Question.find = jest.fn().mockImplementation(() => ({ populate: jest.fn().mockResolvedValueOnce(mockQuestions)}));

        // Making the request
        const response = await supertest(server).get('/tag/getTagsWithQuestionNumber');

        // Asserting the response
        expect(response.status).toBe(200);

        // Asserting the response body
        expect(response.body).toEqual([
                                          { name: 'tag1', qcnt: 2 },
                                          { name: 'tag2', qcnt: 1 },
                                          { name: 'tag3', qcnt: 0 }

                                      ]);
        expect(Tag.find).toHaveBeenCalled();
        expect(Question.find).toHaveBeenCalled();
    });
});
