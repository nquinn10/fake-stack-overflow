const supertest = require("supertest");
const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require('bcryptjs');
const { server, sessionStore } = require("../server");

// ***************************** test userLogin ******************************************
// Mock the User model
jest.mock("../models/user");

describe('POST /user/login', () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterEach(async () => {
        if (server && server.close) {
            await server.close();  // Ensure server is closed after tests
        }
        // Ensure all connections are closed
        if (sessionStore && sessionStore.close) {
            await sessionStore.close();
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
        // Ensure all connections are closed
        if (sessionStore && sessionStore.close) {
            await sessionStore.close();
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

