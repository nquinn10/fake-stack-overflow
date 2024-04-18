// const supertest = require("supertest");
// const mongoose = require("mongoose");
// const { server } = require("../server");

// // Mock the models

// jest.mock('connect-mongo', () => ({
//     create: () => ({
//         get: jest.fn(),
//         set: jest.fn(),
//         destroy: jest.fn(),
//     })
// }));

// jest.mock('../utils/authMiddleware', () => ({
//     authRequired: (req, res, next) => {
//         if (req.session && req.session.userId) {
//             next();
//         } else {
//             res.status(401).send("Unauthorized access. Please log in.");
//         }
//     }
// }));


// describe('Test updateVoteCountAndFlag helper function', () => {
//     beforeEach(() => {
//         jest.resetAllMocks();
//     });

//     afterEach(async () => {
//         if (server && server.close) {
//             await server.close();  // Safely close the server
//         }
//         await mongoose.disconnect();
//     });

//     it('should set the flag to true if vote_count reaches -15', async () => {
//         const ans = {
//             _id: '65e9b58910afe6e94fc6e6d',
//             flag: false,
//             vote_count: -14  // initial state for the test
//         };
    
//         Answer.findById.mockResolvedValue(ans);
        
//         const mockPopulatedAnswer = {
//             _id: ans._id,
//             flag: true,
//             vote_count: ans.vote_count - 1
//         };
    
//         User.findById.mockResolvedValue({
//             _id: 'validUserId',
//             reputation: 20
//         });
    
//         const mockReqBody = {
//             referenceId: ans._id,
//             voteType: 'downvote',
//             onModel: 'Answer'
//         };
    
//         Vote.findOne.mockResolvedValue(mockReqBody);// Sending the vote details
    
//         expect(response.status).toBe(201);  // Status for successful creation/update
//         expect(response.body).toEqual(mockPopulatedAnswer);  // The response should match the updated answer
//     });
// });


// // // Helper function to Flag Question/Answer object if vote count reaches -15, which will flag object for post moderation
// // async function updateVoteCountAndFlag(Model, referenceId, voteChange, onModel) {
// //     // update the vote count on the Question or Answer
// //     const updateItem = await Model.findByIdAndUpdate(referenceId, { $inc: { vote_count: voteChange } }, { new: true });

// //     // check and update flag status if it hits -15 or below
// //     if (updateItem.vote_count <= -15) {
// //         updateItem.flag = true;
// //         await updateItem.save();
// //     }
// //     return updateItem;
// // }