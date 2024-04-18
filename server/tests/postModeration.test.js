// unit tests for post moderation functionality
const supertest = require("supertest");
const mongoose = require("mongoose");
const { server } = require("../server");

const User = require('../models/users');
const Answer = require('../models/answers');

// Mocking the models
jest.mock("../models/questions");
jest.mock("../models/answers");
jest.mock("../models/vote");
jest.mock("../models/user");

jest.mock('connect-mongo', () => ({
    create: () => ({
        get: jest.fn(),
        set: jest.fn(),
        destroy: jest.fn(),
    })
}));

jest.mock('../utils/authMiddleware', () => ({
    authRequired: (req, res, next) => {
        if (req.session && req.session.userId) {
            next();
        } else {
            res.status(401).send("Unauthorized access. Please log in.");
        }
    }
}));

jest.mock('express-session', () => {
    return () => (req, res, next) => {
        req.session = req.testSession || {
            userId: 'validUserId',
            touch: () => {},
        };
        next();
    };
});

// jest.mock('../utils/adminMiddleware', () => ({
//     adminRequired: (req, res, next) => {
//         req.user = req.testSession || { is_admin: true };
//         next();
//     }
// }));

const mockQuestion = {
    _id: '65e9b58910afe6e94fc6e6dc',
    vote_count: -14,
    flag: false, 
    question_status: 'Open'
};

const request = supertest(server);

describe('DELETE /question/deleteQuestion', () => {
    it('should allow deletion of question by admin if question flagged', async () => {

    });
});