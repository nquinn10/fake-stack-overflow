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
            await server.close(); 
        }
        await mongoose.disconnect()
    });

    it("should add a new answer to the question", async () => {
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

        Answer.create.mockResolvedValueOnce(mockAnswer);
        Question.findOneAndUpdate = jest.fn().mockResolvedValueOnce({
                                                                        _id: "dummyQuestionId",
                                                                        answers: ["dummyAnswerId"]
                                                                    });

        // Making the request
        const response = await supertest(server)
            .post("/answer/addAnswer")
            .send(mockReqBody);


        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockAnswer);
        expect(Answer.create).toHaveBeenCalledWith({
                                                       text: "This is a test answer",
                                                       ans_by: "validUserId",
                                                       question: "dummyQuestionId"
                                                   });

        expect(Question.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: "dummyQuestionId" },
            { $push: { answers: { $each: ["dummyAnswerId"], $position: 0 } } },
            { new: true }
        );
    });

    it('should return error not found if question does not exist', async () => {
        Question.findById.mockResolvedValue(null);

        const response = await supertest(server)
            .post('/answer/addAnswer')
            .send({ qid: 'nonexistant', ans: { text: "Answer text" }});

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Internal server error");
    })
});
