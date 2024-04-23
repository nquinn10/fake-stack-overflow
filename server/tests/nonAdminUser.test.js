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

// Mock express-session: validUser logged in, but does not have admin privileges
jest.mock('express-session', () => {
    return () => (req, res, next) => {
        req.session = req.testSession || {
            userId: 'validUserId',
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

// Simulate the actual adminRequired middleware by checking user object
const { adminRequired } = require("../utils/adminMiddleware");

User.findById.mockImplementation(userId => {
    if (userId === "validUserId") {
        return Promise.resolve({ _id: userId, is_moderator: false }); // User without admin privilege
    }
    return Promise.resolve(null);
}); 

const mockFlaggedQuestion = {
        _id: '123',
        title: 'title1',
        text: 'text1',
        vote_count: -17,
        flag: true
    };

const mockFlaggedAnswer = {
        _id: '456',
        text: 'text1',
        vote_count: -17,
        flag: true
    }

// ************************ Test access for postModeration denied *************************

describe('Unauthorized access to /postModeration/ endpoints', () => {
   
    beforeEach(async () => {
        jest.resetAllMocks();
    });

    afterEach(async () => {
        if (server && server.close) {
            await server.close();
        }
        await mongoose.disconnect();
    });

    it('should return 403 for non-admin flaggedQuestions', async () => {
        const response = await supertest(server)
            .get('/postModeration/flaggedQuestions');

        expect(response.status).toBe(403);
        expect(response.text).toContain("Access denied. Administrators only.");
    });

    it('should return 403 for non-admin flaggedAnswers', async () => {
        const response = await supertest(server)
            .get('/postModeration/flaggedAnswers');

        expect(response.status).toBe(403);
        expect(response.text).toContain("Access denied. Administrators only.");
    });

    it('should return 403 for non-admin resetQuestion', async () => {
        const response = await supertest(server)
            .put('/postModeration/resetQuestion/123');

        expect(response.status).toBe(403);
        expect(response.text).toContain("Access denied. Administrators only.");
    });

    it('should return 403 for non-admin resetAnswer', async () => {
        const response = await supertest(server)
            .put('/postModeration/resetAnswer/456');

        expect(response.status).toBe(403);
        expect(response.text).toContain("Access denied. Administrators only.");
    });

    it('should return 403 for non-admin deleteQuestion', async () => {
        const response = await supertest(server)
            .delete('/postModeration/deleteQuestion/123');

        expect(response.status).toBe(403);
        expect(response.text).toContain("Access denied. Administrators only.");
    });

    it('should return 403 for non-admin deleteAnswer', async () => {
        const response = await supertest(server)
            .delete('/postModeration/deleteAnswer/456');

        expect(response.status).toBe(403);
        expect(response.text).toContain("Access denied. Administrators only.");
    });
});