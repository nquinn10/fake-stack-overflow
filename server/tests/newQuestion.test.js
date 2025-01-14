const supertest = require("supertest")
const { default: mongoose } = require("mongoose");

const Question = require('../models/questions');
const { addTag, getQuestionsByOrder, filterQuestionsBySearch } = require('../utils/question');
const { server } = require("../server");

// Mocking the models
jest.mock("../models/questions");
jest.mock('../utils/question', () => ({
    addTag: jest.fn(),
    getQuestionsByOrder: jest.fn(),
    filterQuestionsBySearch: jest.fn(),
}));
jest.mock('connect-mongo', () => ({
    create: () => ({
        get: jest.fn(),
        set: jest.fn(),
        destroy: jest.fn(),
    })
}));
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


const tag1 = {
    _id: '507f191e810c19729de860ea',
    name: 'tag1'
};
const tag2 = {
    _id: '65e9a5c2b26199dbcc3e6dc8',
    name: 'tag2'
};

const ans1 = {
    _id: '65e9b58910afe6e94fc6e6dc',
    text: 'Answer 1 Text',
    ans_by: 'answer1_user',

}

const ans2 = {
    _id: '65e9b58910afe6e94fc6e6dd',
    text: 'Answer 2 Text',
    ans_by: 'answer2_user',

}

const mockQuestions = [
    {
        _id: '65e9b58910afe6e94fc6e6dc',
        title: 'Question 1 Title',
        text: 'Question 1 Text',
        tags: [tag1],
        answers: [ans1],
        views: 21
    },
    {
        _id: '65e9b5a995b6c7045a30d823',
        title: 'Question 2 Title',
        text: 'Question 2 Text',
        tags: [tag2],
        answers: [ans2],
        views: 99
    }
]

const mockPopulatedQuestion = {
    _id: '65e9b5a995b6c7045a30d823',
    title: 'Question 2 Title',
    text: 'Question 2 Text',
    tags: [tag2],
    answers: [
        {
            ...ans2,
            ans_by: { display_name: 'answer2_user' } 
        }
    ],
    views: 100,
    asked_by: { display_name: 'validUserId' }
};

describe('GET /getQuestion', () => {

    beforeEach(() => {
    })

    afterEach(async() => {
        if (server && server.close) {
            await server.close(); 
        }
        await mongoose.disconnect()
    });

    it('should return questions by filter', async () => {
        // Mock request query parameters
        const mockReqQuery = {
            order: 'someOrder',
            search: 'someSearch',
        };

        getQuestionsByOrder.mockResolvedValueOnce(mockQuestions);
        filterQuestionsBySearch.mockReturnValueOnce(mockQuestions);

        const response = await supertest(server)
            .get('/question/getQuestion')
            .query(mockReqQuery);

        // Asserting the response
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockQuestions);
    });
});

describe('GET /getQuestionById/:qid', () => {

    beforeEach(() => {
        Question.findOneAndUpdate = jest.fn().mockReturnThis(); 
        Question.populate = jest.fn().mockReturnThis();  
    })

    afterEach(async() => {
        if (server && server.close) {
            await server.close();  
        }
        await mongoose.disconnect()
    });

    it('should return a question by id and increment its views by 1', async () => {

    
        const mockReqParams = {
            qid: '65e9b5a995b6c7045a30d823',
        };

        Question.findOneAndUpdate.mockImplementationOnce(() => ({
            populate: () => ({ populate: () => Promise.resolve(mockPopulatedQuestion) })
        }));

        const response = await supertest(server)
            .get(`/question/getQuestionById/${mockReqParams.qid}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockPopulatedQuestion);
        expect(Question.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: mockReqParams.qid },
            { $inc: { views: 1 } },
            { new: true }
        );
    });

    it('should return 400 for invalid question ID format', async () => {
        const invalidId = 'invalid-id';
        const response = await supertest(server)
            .get(`/question/getQuestionById/${invalidId}`);
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid question ID format');
    });

    it('should return 404 if the question does not exist', async () => {
        const nonexistentId = '66202d26f7ed0f8e05e7996b'; 
        Question.findOneAndUpdate.mockImplementationOnce(() => ({
            populate: () => ({ populate: () => Promise.resolve(null) })
        }));
        const response = await supertest(server)
            .get(`/question/getQuestionById/${nonexistentId}`);
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Question not found');
    });

});

describe('POST /addQuestion', () => {

    beforeEach(() => {
    })

    afterEach(async() => {
        if (server && server.close) {
            await server.close(); 
        }
        await mongoose.disconnect()
    });

    it('should add a new question', async () => {
        const mockTags = [tag1, tag2];

        const mockQuestion = {
            _id: '65e9b58910afe6e94fc6e6fe',
            title: 'Question 3 Title',
            text: 'Question 3 Text',
            tags: [tag1, tag2],
            answers: [ans1],
        }

        addTag.mockResolvedValueOnce(mockTags);
        Question.create.mockResolvedValueOnce(mockQuestion);

        const response = await supertest(server)
            .post('/question/addQuestion')
            .send(mockQuestion);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockQuestion);
        expect(addTag).toHaveBeenCalledTimes(mockTags.length);
        expect(Question.create).toHaveBeenCalled();

    });
});
