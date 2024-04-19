const supertest = require("supertest");
const mongoose = require("mongoose");
const { server } = require("../server");
const User = require("../models/users");

// Mock connect-mongo used for MongoDB session storage in express-session
jest.mock('connect-mongo', () => ({
    create: () => ({
        get: jest.fn(),
        set: jest.fn(),
        destroy: jest.fn(),
    })
}));

jest.mock('../models/users');

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


// Tests specifically for unauthorized access
describe('Unauthorized Access to /user/ endpoints ', () => {

    beforeAll(async () => {
        // Resetting mocks can clear any previously set return values before each test suite runs
        jest.resetAllMocks();
    });

    afterEach(async () => {
        // Ensure the server is closed after tests to prevent resource leaking
        if (server && server.close) {
            await server.close();
        }
        // Disconnect from mongoose
        await mongoose.disconnect();
    });
    // ***************************** test get /user/profile endpoint *************************************

    it('should return 401 unauthorized if no userId in session', async () => {
        const response = await supertest(server)
            .get('/user/profile');

        expect(response.status).toBe(401);
        expect(response.text).toContain("Unauthorized access. Please log in.");
    });
    // ***************************** test /user/my-questions endpoint *************************************

    it('should return 401 unauthorized if no userId in session', async () => {
        const response = await supertest(server)
            .get('/user/my-questions');

        expect(response.status).toBe(401);
        expect(response.text).toContain("Unauthorized access. Please log in.");
    });
    // ***************************** test /user/my-answers endpoint *************************************

    it('should return 401 unauthorized if no userId in session', async () => {
        const response = await supertest(server)
            .get('/user/my-answers');

        expect(response.status).toBe(401);
        expect(response.text).toContain("Unauthorized access. Please log in.");
    });

    // ***************************** test /user/my-tags endpoint *************************************

    it('should return 401 unauthorized if no userId in session', async () => {
        const response = await supertest(server)
            .get('/user/my-tags');

        expect(response.status).toBe(401);
        expect(response.text).toContain("Unauthorized access. Please log in.");
    });
    // ***************************** test /user/my-question-votes endpoint *************************************

    it('should return 401 unauthorized if no userId in session', async () => {
        const response = await supertest(server)
            .get('/user/my-question-votes');

        expect(response.status).toBe(401);
        expect(response.text).toContain("Unauthorized access. Please log in.");
    });
    // ***************************** test /user/my-answer-votes endpoint *************************************

    it('should return 401 unauthorized if no userId in session', async () => {
        const response = await supertest(server)
            .get('/user/my-answer-votes');

        expect(response.status).toBe(401);
        expect(response.text).toContain("Unauthorized access. Please log in.");
    });

    // ***************************** test patch /user/profile endpoint *************************************

    it('should return 401 unauthorized if no userId in session', async () => {
        const updates = {
            first_name: "John",
            last_name: "Doe",
            display_name: "JohnD",
            about_me: "Hello!",
            location: "USA"
        };

        // Simulate the existing user
        User.findById.mockResolvedValue({
                                            _id: 'validUserId',
                                            first_name: "James", // original data
                                            last_name: "Doe",
                                            display_name: "JamesDoe",
                                            about_me: "Developer",
                                            location: "Boston"
                                        });

        // Expect the user to be updated with new data
        User.findByIdAndUpdate.mockResolvedValue({
                                                     ...updates,
                                                     _id: 'validUserId',
                                                 });

        const response = await supertest(server)
            .patch('/user/profile')
            .send(updates);

        expect(response.status).toBe(401);
        expect(response.text).toContain("Unauthorized access. Please log in.");
    });

    // ***************************** test post /answer/addAnswer endpoint ***********************************
    it("should return 401 unauthorized if no userId in session", async () => {
        const response = await supertest(server)
            .post("/answer/addAnswer")
            .send({ qid: "dummyQuestionId", ans: { text: "Sample answer" } });

        expect(response.status).toBe(401);
        expect(response.text).toContain("Unauthorized access");
    });

    // ***************************** test post /question/addQuestion endpoint ***********************************
    it("should return 401 unauthorized if no userId in session", async () => {
        const response = await supertest(server)
            .post("/question/addQuestion")
            .send({ qid: "dummyQuestionId", ans: { text: "Sample answer" } });

        expect(response.status).toBe(401);
        expect(response.text).toContain("Unauthorized access");
    });

});

describe('Unauthorized access to question/ endpoints', () => {
    // ***************************** test /question/editQuestion *************************************
    
    it('should return 401 unauthorized if no userId in session', async () => {
        const response = await supertest(server)
            .put('/question/editQuestion/65e9b58910afe6e94fc6e6dc')
            .send({ someData: 'data' });

        expect(response.status).toBe(401);
        expect(response.text).toContain("Unauthorized access. Please log in.");
    });
 

 // ***************************** test /question/deleteQuestion ***********************************

    it('should return 401 unauthorized if no userId in session', async () => {
        const response = await supertest(server)
            .delete('/question/deleteQuestion/65e9b58910afe6e94fc6e6dc');

        expect(response.status).toBe(401);
        expect(response.text).toContain("Unauthorized access. Please log in.");
    });
});

describe('Unauthorized access to answer/ endpoints', () => {
    // ******************************* test /answer/editAnswer ***************************************

    it('should return 401 unauthorized if no userId in session', async () => {
        const response = await supertest(server)
            .put('/answer/editAnswer/661dc096d916cd1c9d51655a')
            .send({ someData: 'data' });

        expect(response.status).toBe(401);
        expect(response.text).toContain("Unauthorized access. Please log in.");
    });

 // ******************************* test /answer/deleteAnswer ***************************************

    it('should return 401 unauthorized if no userId in session', async () => {
        const response = await supertest(server)
            .delete('/answer/deleteAnswer/661dc096d916cd1c9d51655a');

        expect(response.status).toBe(401);
        expect(response.text).toContain("Unauthorized access. Please log in.");
    });
});