const supertest = require("supertest");
const mongoose = require("mongoose");
const { server } = require("../server");
const User = require("../models/user");

// Mock connect-mongo used for MongoDB session storage in express-session
jest.mock('connect-mongo', () => ({
    create: () => ({
        get: jest.fn(),
        set: jest.fn(),
        destroy: jest.fn(),
    })
}));

jest.mock('../models/user');

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



});