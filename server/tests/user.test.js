const supertest = require("supertest");
const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require('bcryptjs');

// Mock the User model
jest.mock("../models/user");

let server;
describe('POST /user/login', () => {

    beforeEach(() => {
        server = require("../server");
    });

    afterEach(async () => {
        server.close();
        await mongoose.disconnect();
    });

    // positive test case
    it('should log in successfully with correct credentials', async () => {
        // Mocking the request body
        const password = "pass1";
        const hashedPassword = await bcrypt.hash(password, 10);

        const mockReqBody = {
            username: "user1",
            password: password
        };

        const mockUser = {
            _id: "dummyUserId",
            username: "user1",
            password: hashedPassword
        };

        // Mocking User.findOne()
        User.findOne.mockResolvedValueOnce(mockUser);

        // Making the request
        const response = await supertest(server)
            .post('/user/login')
            .send(mockReqBody);

        // Assert response
        expect(response.status).toBe(200);
        expect(response.text).toBe('Logged in successfully!');
    });

    // negative test case
    it('should fail to log in with incorrect credentials', async () => {
         // Mocking the request body
         const correctPassword = "pass2";
         const incorrectPassword = "pass1";
         const hashedPassword = await bcrypt.hash(correctPassword, 10);

         const mockReqBody = {
            username: "user2",
            password: incorrectPassword
        };

        const mockUser2 = {
            _id: "dummyUserId2",
            username: "user2",
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
});
