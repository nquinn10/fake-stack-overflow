const supertest = require("supertest");
const mongoose = require("mongoose");
const { server } = require("../server");

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
        // Dynamic session management; here, do not set a valid userId by default
        req.session = req.testSession || {
            // Don't set userId to simulate unauthorized access
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

    it('should return 401 unauthorized if no userId in session', async () => {
        const response = await supertest(server)
            .get('/user/profile');

        expect(response.status).toBe(401);
        expect(response.text).toContain("Unauthorized access. Please log in.");
    });

    it('should return 401 unauthorized if no userId in session', async () => {
        const response = await supertest(server)
            .get('/user/my-questions');

        expect(response.status).toBe(401);
        expect(response.text).toContain("Unauthorized access. Please log in.");
    });

});