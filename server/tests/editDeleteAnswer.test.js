const supertest = require("supertest");
const { default: mongoose } = require("mongoose");
const { server, sessionStore } = require("../server");
const Answer = require('../models/answers');

// Mock connect-mongo used for MongoDB session storage in express-session
jest.mock('connect-mongo', () => ({
    create: () => ({
        get: jest.fn(),
        set: jest.fn(),
        destroy: jest.fn(),
    })
}));

jest.mock('../models/answers');

// Mock express-session to manipulate session directly
jest.mock('express-session', () => {
    return () => (req, res, next) => {
        // Don't set userId to simulate unauthorized access
        req.session = req.testSession || {

            touch: () => {},
        };
        next();
    };
});

jest.mock('../utils/authMiddleware', () => ({
    authRequired: (req, res, next) => {
        if (req.session && req.session.userId) {
            next();
        } else {
            res.status(401).send("Unauthorized access. Please log in.");
        }
    }
}));

jest.mock("../models/answers");

  const mockAnswer = {
    _id: '661dc096d916cd1c9d51655a',
    ans_by: 'validUserId',
    text: 'Old Text'
  };

// ******************************* Test Edit Answer *************************************
describe('PUT /editAnswer/:aid', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.resetAllMocks();
        Answer.findById.mockReset();
        Answer.findByIdAndUpdate.mockReset();
    });

    afterEach(async () => {
        // Ensure the server is closed after tests to prevent resource leaking
        if (server && server.close) {
            await server.close();
        }
        // Disconnect from mongoose
        await mongoose.disconnect();
    });

    // ensure user logged in
    it('should return 401 authorized if no userId in session', async () => {
        const response = await supertest(server)
            .put('/answer/editAnswer/661dc096d916cd1c9d51655a')
            .send({ someData: 'data' });

        expect(response.status).toBe(401);
        expect(response.text).toContain("Unauthorized access. Please log in.");
    });

    // ensure valid answer
    it('should return 404 if question not found', async () => {
        Answer.findById.mockResolvedValue(null);

        const response = await supertest(server)
            .put('/answer/editAnswer/123')
            .send({ text: 'New text' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Answer not found');
    });

    // ensure logged in user is author of the answer
    it('should return 403 if user is not the author', async () => {
        Answer.findById.mockResolvedValue({
            _id: '661dc096d916cd1c9d51655a',
            ans_by: 'otherUser'
        });

        const response = await supertest(server)
            .put('answer/editAnswer/661dc096d916cd1c9d51655a')
            .send({ text: 'New Text' });

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Unauthorized: you are not the author of this answer');
    });

    // if logged in user is author, and valid answer, successfully delete answer
    it('should update the answer is user is author', async () => {
        Answer.findById.mockResolvedValue({
            _id: '661dc096d916cd1c9d51655a',
            ans_by: 'validUserId',
            text: 'Old Text'
        });

        Answer.findByIdAndUpdate.mockResolvedValue({
            _id: '661dc096d916cd1c9d51655a',
            ans_by: 'validUserId',
            text: 'Updated Text'
        });

        const response = await supertest(server)
            .put('/answer/editAnswer/661dc096d916cd1c9d51655a')
            .send({ text: 'New Text' });

        expect(response.status).toBe(200);
        expect(response.body.text).toBe('New Text');
    }); 

});

// ******************************* Test Delete Answer ***********************************

describe('DELETE /deleteAnswer/:aid', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Answer.findById.mockReset();
        Answer.findByIdAndDelete.mockReset();
    });

    afterEach(async () => {
        if (server && server.close) {
            await server.close();
        }
        if (sessionStore && sessionStore.close) {
            await sessionStore.close();
        }
        await mongoose.disconnect();
    });

    // ensure user logged in
    it('should return 401 unauthorized if no userId in session', async () => {
        const response = await supertest(server)
            .delete('/answer/editAnswer/661dc096d916cd1c9d51655a');

        expect(response.status).toBe(401);
        expect(response.text).toContain("Unauthorized access. Please log in.");
    });

    // test answer not found
    it('should return 404 if answer not found', async () => {
        Answer.findById.mockResolvedValue(null);

        const response = await supertest(server)
            .delete('/answer/deleteAnswer/123');

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Answer not found');
    });

    // Test unauthorized deletion
    it('should return 403 if user is not the author', async () => {
        Answer.findById.mockResolvedValue({
            _id: '661dc096d916cd1c9d51655a',
            ans_by: 'validUserId'
        });

        const response = await supertest(server)
            .delete('/answer/deleteAnswer/661dc096d916cd1c9d51655a');

        expect(response.status).toBe(403);
        expect(response.body.error).toBe('Unauthorized: You are not the author of this answer');
    });

    // Test successful deletion
    it('should delete the answer if the user is the author', async () => {
        Answer.findById.mockResolvedValue({
            _id: '661dc096d916cd1c9d51655a',
            ans_by: 'validUserId'
        });
        Answer.findByIdAndDelete.mockResolvedValue(true);

        const response = await supertest(server)
            .delete('/answer/deleteAnswer/661dc096d916cd1c9d51655a');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Answer has been deleted');
    });
});
