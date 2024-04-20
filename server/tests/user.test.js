const supertest = require("supertest");
const { default: mongoose } = require("mongoose");
const User = require("../models/users");
const Question = require("../models/questions");
const Answer = require("../models/answers");
const Vote = require("../models/votes");
const bcrypt = require('bcryptjs');
const { server } = require("../server");
jest.mock('connect-mongo', () => ({
    create: () => ({
        get: jest.fn(),
        set: jest.fn(),
        destroy: jest.fn(),
    })
}));
jest.mock('../models/users');
jest.mock("../models/questions");
jest.mock("../models/answers");
jest.mock('../models/votes');
// jest.mock('../models/questions', () => ({
//     find: jest.fn().mockReturnThis(),
//     populate: jest.fn().mockReturnThis(),
//     select: jest.fn().mockReturnThis()
// }));

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

const mockQuestionVotes = [
    {
        _id: "661ddc07f49939b726ea58f1",
        referenceId: {
            _id: "661ddc07f49939b726ea58e9",
            title: "Programmatically navigate using React router",
            text: "TEST TEXT",
            asked_by: {
                _id: "661ddc07f49939b726ea58c7",
                display_name: "betty_j"
            },
            ask_date_time: "2022-01-20T08:00:00.000Z",
            views: 10,
            tags: [
                { _id: "661ddc07f49939b726ea58cb", name: "react" },
                { _id: "661ddc07f49939b726ea58cd", name: "javascript" }
            ],
            vote_count: 0
        },
        voteType: "upvote",
        createdAt: "2024-04-16T02:01:43.789Z"
    },
    {
        _id: "661ddc07f49939b726ea54j9",
        referenceId: {
            _id: "661ddc07f49939b726ea90lo",
            title: "Object storage for a web application",
            text: "TEST TEXT",
            asked_by: {
                _id: "661ddc07f49939b726ea58c7",
                display_name: "johnD"
            },
            ask_date_time: "2022-01-20T03:00:00.000Z",
            views: 10,
            tags: [
                { _id: "661ddc07f49939b726ea58cb", name: "react" },
                { _id: "661ddc07f49939b726ea58cd", name: "javascript" }
            ],
            vote_count: 0
        },
        voteType: "downvote",
        createdAt: "2024-06-22T02:02:50.789Z"
    }
];

const mockAnswerVotes = [
    {
        _id: "661ddc07f49939b726ea59f1",
        referenceId: {
            _id: "661ddc07f49939b726ea59e9",
            text: "This is an answer.",
            ans_by: {
                _id: "661ddc07f49939b726ea58c7",
                display_name: "betty_j"
            },
            ans_date_time: "2022-01-20T08:00:00.000Z",
            vote_count: 2
        },
        voteType: "upvote",
        createdAt: "2024-04-16T02:01:43.789Z"
    },
    {
        _id: "661ddc07f49939b726ea54k9",
        referenceId: {
            _id: "661ddc07f49939b726ea90lk",
            text: "Another answer here.",
            ans_by: {
                _id: "661ddc07f49939b726ea58c7",
                display_name: "johnD"
            },
            ans_date_time: "2022-01-20T03:00:00.000Z",
            vote_count: 5
        },
        voteType: "downvote",
        createdAt: "2024-06-22T02:02:50.789Z"
    }
];

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
            display_name: "fake_display_name",
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
        const responseJson = JSON.parse(response.text);
        expect(responseJson.message).toBe('Logged in successfully!');
        expect(responseJson.display_name).toBe('fake_display_name');
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
});

// ***************************** test getUserAnswers *************************************
describe('GET /user/my-answered-questions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(async () => {
        if (server && server.close) {
            await server.close();  // Ensure server is closed after tests
        }
        await mongoose.disconnect();
    });

    it('should retrieve answered questions posted by the user', async () => {
        const mockAnswers = [{
            _id: 'answer1',
            text: 'This is an answer',
            ans_date_time: new Date('2023-11-20T08:24:42.000Z'),
            vote_count: 5,
            question: {
                _id: 'question1',
                title: 'Question 1 Title',
                text: 'Question 1 Text',
                asked_by: 'validUserId',
                tags: [{ _id: 'tag1', name: 'JavaScript' }],
                ask_date_time: new Date('2022-01-20T08:00:00.000Z'),
                views: 10,
                vote_count: 1
            }
        }];

        // Set up the mock to return answers
        Answer.find.mockImplementation(() => ({
            populate: jest.fn().mockResolvedValueOnce(mockAnswers)
        }));

        const response = await supertest(server)
            .get('/user/my-answers');

        expect(response.status).toBe(200);
        expect(Answer.find).toHaveBeenCalledWith({ ans_by: 'validUserId' });
        expect(response.body.length).toBe(1);
        expect(response.body[0]).toHaveProperty('question.title', 'Question 1 Title');
        expect(response.body[0].answer).toHaveProperty('text', 'This is an answer');
    });

    it('should return an empty array when no answers are found', async () => {
        // Set up the mock to return an empty array
        Answer.find.mockImplementation(() => ({
            populate: jest.fn().mockResolvedValueOnce([])
        }));

        const response = await supertest(server)
            .get('/user/my-answers');

        expect(response.status).toBe(404);
        expect(Answer.find).toHaveBeenCalledWith({ ans_by: 'validUserId' });
        expect(response.text).toContain("No answered questions found.");
    });
});

// ***************************** test getUserTags *************************************
describe('GET /my-tags', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(async () => {
        if (server && server.close) {
            await server.close();
        }
        await mongoose.disconnect();
    });

    it('should retrieve unique tags from questions posted by the user', async () => {
        const mockQuestions = [
            {
                _id: 'Question1',
                title: 'Question 1 Text',
                text: 'Test Question 1 ....',
                asked_by: 'validUserId',
                tags: [{ _id: 'tag1', name: 'JavaScript' }, { _id: 'tag2', name: 'Node.js' }],
                answers: [{ _id: 'answer1', text: 'This is an answer to question 1' }],
                views: 20
            },
            {
                _id: 'Question2',
                title: 'Question 2 Text',
                text: 'Test Question 2 ....',
                asked_by: 'validUserId',
                tags: [{ _id: 'tag3', name: 'Python' }, { _id: 'tag1', name: 'JavaScript' }],
                answers: [{ _id: 'answer2', text: 'This is an answer to question 2' }],
                views: 15
            }
        ];

        Question.find.mockImplementation(() => ({
            populate: jest.fn().mockResolvedValueOnce(mockQuestions)
        }));

        const response = await supertest(server)
            .get('/user/my-tags');

        expect(Question.find).toHaveBeenCalledWith({ asked_by: 'validUserId' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual(['JavaScript', 'Node.js', 'Python']);
    });

    it('should return a 404 when no questions or tags are found', async () => {
        Question.find.mockImplementation(() => ({
            populate: jest.fn().mockResolvedValueOnce([])
        }));

        const response = await supertest(server)
            .get('/user/my-tags');

        expect(Question.find).toHaveBeenCalledWith({ asked_by: 'validUserId' });
        expect(response.status).toBe(404);
        expect(response.text).toContain("No questions or tags found.");
    });
});


// ***************************** test getUserQuestionVotes *************************************
describe('GET /user/my-question-votes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(async () => {
        if (server && server.close) {
            await server.close();
        }
        await mongoose.disconnect();
    });

    it('should retrieve user question votes successfully', async () => {
        // Mock Vote.find method
        Vote.find.mockImplementation(() => ({
            populate: jest.fn().mockImplementationOnce(() => ({
                populate: jest.fn().mockReturnThis(), // For nested population
                select: jest.fn().mockResolvedValueOnce(mockQuestionVotes)
            })),
            select: jest.fn().mockReturnThis()
        }));

        const response = await supertest(server)
            .get('/user/my-question-votes');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockQuestionVotes);
        expect(Vote.find).toHaveBeenCalledWith({ user: 'validUserId', onModel: 'Question' });
    });

    it('should retrieve only upvote question votes for the user', async () => {
        const mockUpvoteVotes = mockQuestionVotes.filter(vote => vote.voteType === "upvote");

        Vote.find.mockImplementation(() => ({
            populate: jest.fn().mockImplementationOnce(() => ({
                populate: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValueOnce(mockUpvoteVotes)
            })),
            select: jest.fn().mockReturnThis()
        }));

        const response = await supertest(server)
            .get('/user/my-question-votes?voteType=upvote');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUpvoteVotes);
        expect(Vote.find).toHaveBeenCalledWith({ user: 'validUserId', onModel: 'Question', voteType: 'upvote' });
    });

    it('should retrieve only downvote question votes for the user', async () => {
        const mockDownvoteVotes = mockQuestionVotes.filter(vote => vote.voteType === "downvote");

        Vote.find.mockImplementation(() => ({
            populate: jest.fn().mockImplementationOnce(() => ({
                populate: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValueOnce(mockDownvoteVotes)
            })),
            select: jest.fn().mockReturnThis()
        }));

        const response = await supertest(server)
            .get('/user/my-question-votes?voteType=downvote');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockDownvoteVotes);
        expect(Vote.find).toHaveBeenCalledWith({ user: 'validUserId', onModel: 'Question', voteType: 'downvote' });
    });

    it('should handle no votes found', async () => {
        // Mock Vote.find method
        Vote.find.mockImplementation(() => ({
            populate: jest.fn().mockImplementationOnce(() => ({
                populate: jest.fn().mockReturnThis(), // For nested population
                select: jest.fn().mockResolvedValueOnce([])
            })),
            select: jest.fn().mockReturnThis()
        }));

        const response = await supertest(server)
            .get('/user/my-question-votes');

        expect(response.status).toBe(404);
        expect(response.text).toContain("No question votes found");
    });

});
// ***************************** test getUserAnswerVotes *************************************
describe('GET /user/my-answer-votes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(async () => {
        if (server && server.close) {
            await server.close();
        }
        await mongoose.disconnect();
    });

    it('should retrieve user answer votes successfully', async () => {
        Vote.find.mockImplementation(() => ({
            populate: jest.fn().mockImplementationOnce(() => ({
                populate: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValueOnce(mockAnswerVotes)
            })),
            select: jest.fn().mockReturnThis()
        }));

        const response = await supertest(server)
            .get('/user/my-answer-votes');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockAnswerVotes);
        expect(Vote.find).toHaveBeenCalledWith({ user: 'validUserId', onModel: 'Answer' });
    });

    it('should retrieve only upvote answer votes for the user', async () => {
        const mockUpvoteVotes = mockAnswerVotes.filter(vote => vote.voteType === "upvote");

        Vote.find.mockImplementation(() => ({
            populate: jest.fn().mockImplementationOnce(() => ({
                populate: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValueOnce(mockUpvoteVotes)
            })),
            select: jest.fn().mockReturnThis()
        }));

        const response = await supertest(server)
            .get('/user/my-answer-votes?voteType=upvote');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUpvoteVotes);
        expect(Vote.find).toHaveBeenCalledWith({ user: 'validUserId', onModel: 'Answer', voteType: 'upvote' });
    });

    it('should retrieve only downvote answer votes for the user', async () => {
        const mockDownvoteVotes = mockAnswerVotes.filter(vote => vote.voteType === "downvote");

        Vote.find.mockImplementation(() => ({
            populate: jest.fn().mockImplementationOnce(() => ({
                populate: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValueOnce(mockDownvoteVotes)
            })),
            select: jest.fn().mockReturnThis()
        }));

        const response = await supertest(server)
            .get('/user/my-answer-votes?voteType=downvote');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockDownvoteVotes);
        expect(Vote.find).toHaveBeenCalledWith({ user: 'validUserId', onModel: 'Answer', voteType: 'downvote' });
    });

    it('should handle no votes found', async () => {
        Vote.find.mockImplementation(() => ({
            populate: jest.fn().mockImplementationOnce(() => ({
                populate: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValueOnce([])
            })),
            select: jest.fn().mockReturnThis()
        }));

        const response = await supertest(server)
            .get('/user/my-answer-votes');

        expect(response.status).toBe(404);
        expect(response.text).toContain("No answer votes found");
    });
});

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
