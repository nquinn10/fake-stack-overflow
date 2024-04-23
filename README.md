# Final Team Project for CS5500

Login with your Northeastern credentials and read the project description [here](https://northeastern-my.sharepoint.com/:w:/g/personal/j_mitra_northeastern_edu/ETUqq9jqZolOr0U4v-gexHkBbCTAoYgTx7cUc34ds2wrTA?e=URQpeI).

## List of features

All the features you have implemented. 

| Feature   | Description     | E2E Tests      | Component Tests | Jest Tests     |
|-----------|-----------------|----------------|-----------------|----------------|
| View posts - all questions | Aggregate and display all questions posted to the forum for discussion, along with information on each post (tags, # votes, # answers, # views). Filter by newest/active/unanswered | client/cypress/e2e/home.cy.js | path/to/test    | server/tests/question.test.js  |
| View post - individual question page | Aggregate and display all information about a specific question, including entire problem description and all answers to that question | client/cypress/e2e/answers.cy.js | path/to/test    | TO ADD STILL  |
| Create new post - ask question | Logged-in user can generate a new public question to forum by giving title, question text, and relevant tags | client/cypress/e2e/newQuestion.cy.js | path/to/test    | server/tests/newQuestion.test.js |
| Search for existing posts | Query the questions on the platform based on the content of their title/description, or based on their tags. Filter results by active/newest/unanswered | client/cypress/e2e/search.cy.js | path/to/test    | TO DO - Separate from question.test.js |
| Comment on post - add answer | Logged-in user can provide an answer to an existing question on the forum by posting a detailed response to a specific question. The new answer is then displayed on the question's page | client/cypress/e2e/newAnswer.cy.js | path/to/test  | server/tests/newAnswer.test.js   |
| Voting on posts | Logged-in users with enough reputation points (which is awarded by user's content receiving upvotes) can upvote/downvote a question or answer to indicate the usefullness, quality, or relevance of the post | client/cypress/e2e/vote.cy.js | path/to/test    | server/tests/vote.test.js AND server/tests/voteUtils.test.js   |
| Tagging posts | Logged-in user can tag a new question with up to 5 relevant tags that describe the topic of the question. Users can update tags of a question they asked by editing the question | client/cypress/e2e/tags.cy.js | path/to/test    | server/tests/tags.test.js   |
| User Profile - registration | Unregistered users can create a new account to become active member and make contributions to the platform, including asking a question, answering a question, and voting on questions/answers. Upon successful registration, user's information is added to the database, with a hashed password | client/cypress/e2e/userRegistration.cy.js | path/to/test    | server/tests/user.test.js   |
| User Profile - authentication | Registered user can log in to the application with their email address and password to personalize their profile, see all questions/answers they contributed, ask a question, answer existing questions,and vote on questions/answers. Upon authentication, a session cookie is created by the server, which stores the session ID. This session ID is inaccessible to client-side scripts | client/cypress/e2e/userLogin.cy.js | path/to/test    | server/tests/user.test.js AND server/tests/unauthenticatedUser.test.js   |
| User Profile - profile updates | Registered user profile that provides personalized information about logged-in user and their contributions to the platform, including their asked questions, posted answers, any tags they've participated in, any votes cast, and gives the option to edit/delete their personal information and their questions/answers | client/cypress/e2e/userProfile.cy.js | path/to/test    | server/tests/user.test.js  |
| Post Moderation | Allows logged-in site moderators to review and manage individual questions and answers on the platform that have been flagged. A question/answer is automatically flagged for review if its vote count reaches -15. Upon being flagged, the question/answer must be reviewed by a moderator where it can be reset (vote count reset to 0, flag removed) if it is, in fact, helpful/useful content, or deleted from the website if is deemed unhelpful or irrelevant | client/cypress/e2e/postModeration.cy.js | path/to/test    | server/tests/postModeration.test.js   |
| Edit Post | Logged-in user can edit any questions or answers they contributed to the platform. Update question title/description/tags, or update answer text | client/cypress/e2e/editDeleteAnswer.cy.js AND client/cypress/e2e/editDeleteQuestion.cy.js | path/to/test    | server/tests/editDeleteAnswer.test.js AND editDeleteQuestion.test.js   |
| Delete Post | Logged-in user can delete any questions or answers they contributed to the platform. Deleted content no longer appears on the platform, and user's aggregated contributions are updated accordingly | client/cypress/e2e/editDeleteAnswer.cy.js AND client/cypress/e2e/editDeleteQuestion.cy.js | path/to/test    | server/tests/editDeleteAnswer.test.js AND server/tests/editDeleteQuestion.test.js   |
| ... | This is feature... | /path/to/test | path/to/test    | path/to/test   |
| ... | This is feature ... | /path/to/test | path/to/test    | path/to/test   |
| ... | This is feature ... | /path/to/test | path/to/test    | path/to/test   |

. . .

## Instructions to generate and view coverage report 

## Extra Credit Section (if applicable)