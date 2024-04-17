// Unit tests for addAnswer in contoller/answer.js

const supertest = require("supertest")
const { default: mongoose } = require("mongoose");

const Answer = require("../models/answers");
const Question = require("../models/questions");

const { server, sessionStore } = require("../server");

// Mock the Answer model
jest.mock("../models/answers");

describe("POST /addAnswer", () => {

    beforeEach(() => {
    })

    afterEach(async() => {
        if (server && server.close) {
            await server.close();  // Safely close the server
        }
        if (sessionStore && sessionStore.close) {
            await sessionStore.close();  // Ensure the session store is closed
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
