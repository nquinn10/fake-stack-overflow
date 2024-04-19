// Unit tests for addAnswer in contoller/answer.js

const supertest = require("supertest")
const { default: mongoose } = require("mongoose");
const Answer = require("../models/answers");
const Question = require("../models/questions");

const { server } = require("../server");

jest.mock('connect-mongo', () => ({
    create: () => ({
        get: jest.fn(),
        set: jest.fn(),
        destroy: jest.fn(),
    })
}));

jest.mock("../models/questions");
jest.mock("../models/answers");

jest.mock('express-session', () => {
    return () => (req, res, next) => {
        req.session = {
            userId: 'validUserId',
            touch: () => {},
        };
        next();
    };
});
jest.mock('../utils/authMiddleware', () => ({
    authRequired: (req, res, next) => {
        req.session = { userId: 'validUserId' };
        next();
    }
}));

describe("POST /addAnswer", () => {

    beforeEach(() => {
    })

    afterEach(async() => {
        if (server && server.close) {
            await server.close();  // Safely close the server
        }
        await mongoose.disconnect()
    });

    it("should add a new answer to the question", async () => {
        // Mocking the request body
        const mockReqBody = {
            qid: "dummyQuestionId",
            ans: {
                text: "This is a test answer"
            }
        };

        const mockAnswer = {
            _id: "dummyAnswerId",
            text: "This is a test answer",
            question: "dummyQuestionId"
        }
        // Mock the create method of the Answer model
        Answer.create.mockResolvedValueOnce(mockAnswer);

        // Mocking the Question.findOneAndUpdate method
        Question.findOneAndUpdate = jest.fn().mockResolvedValueOnce({
                                                                        _id: "dummyQuestionId",
                                                                        answers: ["dummyAnswerId"]
                                                                    });

        // Making the request
        const response = await supertest(server)
            .post("/answer/addAnswer")
            .send(mockReqBody);

        // Asserting the response
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockAnswer);

        // Verifying that Answer.create method was called with the correct arguments
        expect(Answer.create).toHaveBeenCalledWith({
                                                       text: "This is a test answer",
                                                       question: "dummyQuestionId"
                                                   });

        // Verifying that Question.findOneAndUpdate method was called with the correct arguments
        expect(Question.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: "dummyQuestionId" },
            { $push: { answers: { $each: ["dummyAnswerId"], $position: 0 } } },
            { new: true }
        );
    });
});
