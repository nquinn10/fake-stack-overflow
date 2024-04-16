const supertest = require("supertest");
const mongoose = require("mongoose");
const User = require("../models/user");
const Question = require("../models/questions");
const bcrypt = require('bcryptjs');
const { server } = require("../server");
jest.mock('connect-mongo', () => ({
    create: () => ({
        get: jest.fn(),
        set: jest.fn(),
        destroy: jest.fn(),
    })
}));
jest.mock('../models/user');
jest.mock('../models/questions');

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

// ***************************** test userLogin ******************************************
describe('POST /user/login', () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterEach(async () => {
        if (server && server.close) {
            await server.close();  // Ensure server is closed after tests
        }
        await mongoose.disconnect();
    });

    // positive test case
    it('should log in successfully with correct credentials', async () => {
        // Mocking the request body
        const password = "pass1";
        const hashedPassword = await bcrypt.hash(password, 10);

        const mockReqBody = {
            email: "user1",
            password: password
        };

        const mockUser = {
            _id: "dummyUserId",
            email: "user1",
            password: hashedPassword
        };

        // Mocking User.findOne()
        User.findOne.mockResolvedValueOnce(mockUser);

        // Making the request
        const response = await supertest(server)
            .post('/user/login')
            .send(mockReqBody);

        // Assert response
        expect(User.findOne).toHaveBeenCalledWith({ email: "user1" });
        expect(response.status).toBe(200);
        expect(response.text).toBe('Logged in successfully!');
    });

    // negative test case - invalid user password
    it('should fail to log in with incorrect credentials', async () => {
         // Mocking the request body
         const correctPassword = "pass2";
         const incorrectPassword = "pass1";
         const hashedPassword = await bcrypt.hash(correctPassword, 10);

         const mockReqBody = {
             email: "user2",
            password: incorrectPassword
        };

        const mockUser2 = {
            _id: "dummyUserId2",
            email: "user2",
            password: hashedPassword // wrong password, should fail
        };

        // Mocking User.findOne()
        User.findOne.mockResolvedValueOnce(mockUser2);

        // Making the request
        const response = await supertest(server)
            .post('/user/login')
            .send(mockReqBody);


        // Asserting the response
        expect(response.status).toBe(401);
        expect(response.text).toBe('Invalid credentials');
    });

    // negative test case - user email not found
    it('should fail to log in when the user email does not exist', async () => {
        // Mocking the request body
        const mockReqBody = {
            email: "nonexistent@example.com",
            password: "password"
        };

        // Mocking User.findOne() to simulate no user found
        User.findOne.mockResolvedValueOnce(null);

        // Making the request
        const response = await supertest(server)
            .post('/user/login')
            .send(mockReqBody);

        // Asserting the response
        expect(response.status).toBe(404);
        expect(response.text).toBe('User not found');
    });
});

// ***************************** test userRegistration *************************************
describe('POST /user/register', () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterEach(async () => {
        if (server && server.close) {
            await server.close();  // Ensure server is closed after tests
        }
        await mongoose.disconnect();
    });

    // Test for successful registration
    it('should register a new user successfully', async () => {
        const mockReqBody = {
            first_name: "Jane",
            last_name: "Dixon",
            email: "janedixon@example.com",
            password: "pass123",
            display_name: "JaneD",
            about_me: "Test user",
            location: "Testville"
        };

        // Mock User.findOne to return null, indicating no existing user
        User.findOne.mockResolvedValueOnce(null);
        // simulating mongodb behavior by setting unique id for new user
        const newUser = {...mockReqBody, _id: '12345'};
        User.prototype.save.mockResolvedValueOnce(newUser);


        const response = await supertest(server)
            .post('/user/register')
            .send(mockReqBody);

        expect(response.status).toBe(201);
        expect(response.text).toBe('User registered successfully');
        expect(User.findOne).toHaveBeenCalledWith({ email: "janedixon@example.com" });
    });

    // Test for registration with an existing email
    it('should not register a user with an existing email', async () => {
        const mockReqBody = {
            first_name: "Steve",
            last_name: "Example",
            email: "existing@email.com",
            password: "password123",
            display_name: "Steve_Ex",
            about_me: "Test User",
            location: "Exampleville"
        };

        // mock existing user with same id
        const existingUser = {
            _id: "existingUserId",
            email: "existing@email.com",
            password: "password456",
            display_name: "Steve_old",
            about_me: "Test User",
            location: "Exampleville"
        };

        // Mock User.findOne to stimulate an existing user
        User.findOne.mockResolvedValueOnce(existingUser);

        const response = await supertest(server)
            .post('/user/register')
            .send(mockReqBody);

        expect(response.status).toBe(400);
        expect(response.text).toBe('User already exists');
        expect(User.findOne).toHaveBeenCalledWith({ email: "existing@email.com" });
    });
});

// ***************************** test userProfileSummary *************************************

describe('GET /user/profile', () => {

    beforeAll(async () => {
        jest.resetAllMocks();
    });

    afterEach(async () => {
        if (server && server.close) {
            await server.close();  // Ensure server is closed after tests
        }
        await mongoose.disconnect();
    });

    it('should retrieve a user profile successfully', async () => {
        User.findById.mockImplementation(() => ({
            select: jest.fn().mockResolvedValue({
                                                    _id: 'validUserId',
                                                    first_name: 'John',
                                                    last_name: 'Doe',
                                                    email: 'john@example.com',
                                                    display_name: 'JohnD',
                                                    about_me: 'Developer',
                                                    location: 'Earth',
                                                    reputation: 100
                                                })
        }));

        const response = await supertest(server)
            .get('/user/profile');

        expect(User.findById).toHaveBeenCalledWith("validUserId");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
                                          first_name: "John",
                                          last_name: "Doe",
                                          email: "john@example.com",
                                          display_name: "JohnD",
                                          about_me: "Developer",
                                          location: "Earth",
                                          reputation: 100
                                      });
    });

    it('should return 404 if user is not found', async () => {
        User.findById.mockImplementation(() => ({
            select: jest.fn().mockResolvedValue(null)
        }));

        const response = await supertest(server)
            .get('/user/profile');

        expect(User.findById).toHaveBeenCalledWith("validUserId");
        expect(response.status).toBe(404);
        expect(response.text).toContain("User not found");
    });
});

// ***************************** test getUserQuestions *************************************
describe('GET /my-questions', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    afterEach(async () => {
        if (server && server.close) {
            await server.close();  // Ensure server is closed after tests
        }
        await mongoose.disconnect();
    });

    it('should retrieve questions posted by the user', async () => {
        const mockQuestions = [{
            _id: 'question1',
            title: 'Question 1 Title',
            text: 'Question 1 Text',
            asked_by: 'validUserId',
            tags: [],
            answers: [],
            views: 10
        }];

        // Set up the mock to return some questions
        Question.find.mockImplementation(() => ({
            populate: jest.fn().mockResolvedValueOnce(mockQuestions)
        }));

        const response = await supertest(server)
            .get('/user/my-questions');

        expect(response.status).toBe(200);
        expect(Question.find).toHaveBeenCalledWith({ asked_by: 'validUserId' });
        expect(response.body).toEqual(mockQuestions);
        expect(response.body.length).toBe(1);
    });

    it('should return an empty array when no questions are found', async () => {
        // Set up the mock to return an empty array
        Question.find.mockImplementation(() => ({
            populate: jest.fn().mockResolvedValueOnce([])
        }));

        const response = await supertest(server)
            .get('/user/my-questions');

        expect(response.status).toBe(404);
        expect(Question.find).toHaveBeenCalledWith({ asked_by: 'validUserId' });
        expect(response.text).toContain("No questions found.");
    });

    it('should return detailed question data with tags and answers populated', async () => {
        const mockQuestions = [{
            _id: 'question1',
            title: 'Detailed Question',
            text: 'This question has details',
            asked_by: 'validUserId',
            tags: [{ _id: 'tag1', name: 'JavaScript' }],
            answers: [{ _id: 'answer1', text: 'This is an answer' }],
            views: 20
        }];

        // Mock find to resolve with detailed question
        Question.find.mockImplementation(() => ({
            populate: jest.fn().mockResolvedValueOnce(mockQuestions)
        }));

        const response = await supertest(server)
            .get('/user/my-questions');

        expect(response.status).toBe(200);
        expect(Question.find).toHaveBeenCalledWith({ asked_by: 'validUserId' });
        expect(response.body).toEqual(mockQuestions);
        expect(response.body[0].tags).toEqual(expect.arrayContaining([
                                                                         { _id: "tag1", name: "JavaScript" }
                                                                     ]));
        expect(response.body[0].answers).toEqual(expect.arrayContaining([{ _id: 'answer1', text: 'This is an answer' }]));
    });

    it('should handle server errors gracefully', async () => {
        // Simulate a server error during database operation
        Question.find.mockImplementation(() => ({
            populate: jest.fn().mockRejectedValue(new Error("Database error"))
        }));

        const response = await supertest(server)
            .get('/user/my-questions');

        expect(response.status).toBe(500);
        expect(response.text).toContain("An error occurred while fetching the questions.");
    });
});

// ***************************** test getUserAnswers *************************************
// ***************************** test getUserTags *************************************
// ***************************** test getUserQuestionVotes *************************************
// ***************************** test getUserAnswerVotes *************************************
// ***************************** test updateUserProfile *************************************

describe('PATCH /profile', () => {
    const mockUserId = 'validUserId';

    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterEach(async () => {
        await mongoose.disconnect();
        if (server && server.close) {
            await server.close();
        }
    });

    it('should return 400 when no updates are provided', async () => {
        const response = await supertest(server)
            .patch('/user/profile')
            .send({}); // Empty body

        expect(response.status).toBe(400);
        expect(response.text).toContain("No updates provided.");
    });

    it('should handle user not found', async () => {
        User.findByIdAndUpdate.mockResolvedValue(null);

        const response = await supertest(server)
            .patch('/user/profile')
            .send({ first_name: "John" });

        expect(response.status).toBe(404);
        expect(response.text).toContain("User not found.");
    });

    it('should successfully update the user profile', async () => {
        const updates = {
            first_name: "John",
            last_name: "Doe",
            display_name: "JohnD",
            about_me: "Hello!",
            location: "USA"
        };

        // Simulate the existing user
        User.findById.mockResolvedValue({
                                            _id: mockUserId,
                                            first_name: "James", // original data
                                            last_name: "Doe",
                                            display_name: "JamesDoe",
                                            about_me: "Developer",
                                            location: "Boston"
                                        });

        // Expect the user to be updated with new data
        User.findByIdAndUpdate.mockResolvedValue({
                                                     ...updates,
                                                     _id: mockUserId,
                                                 });

        const response = await supertest(server)
            .patch('/user/profile')
            .send(updates);

        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
            mockUserId,
            { $set: updates },
            { new: true, runValidators: true, context: 'query' }
        );
        expect(response.status).toBe(200);
        expect(response.body.user).toEqual(expect.objectContaining(updates));
    });


});
