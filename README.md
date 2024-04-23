# Final Team Project for CS5500

Fake Stack Overflow: nicole-katie

This is our implementation of the Fake Stack Overflow application. We have implemented the following requirements:
- View posts
- Create new posts
- Search for existing posts
- Commenting on posts
- Voting on posts
- Tagging posts
- User profile
- Post moderation

Below, you can see the break-down of the specific requirements and how they translate into the different features our application provides. We have also provided a mapping of the different test files for each feature. 

## List of features

| Feature   | Description     | E2E Tests      | Component Tests | Jest Tests     |
|-----------|-----------------|----------------|-----------------|----------------|
| VIEW POST - all questions | Aggregate and display all questions posted to the forum for discussion, along with information on each post (tags, # votes, # answers, # views). Filter by newest/active/unanswered | client/cypress/e2e/home.cy.js | client/cypress/component/question_page.cy.js   | server/tests/question.test.js  |
| VIEW POST - individual question page | Aggregate and display all information about a specific question, including entire problem description and all answers to that question | client/cypress/e2e/answers.cy.js | client/cypress/component/answer_page.cy.js    | server/tests/newQuestion.test.js  |
| CREATE NEW POST - ask question | Logged-in user can generate a new public question to forum by giving title, question text, and relevant tags | client/cypress/e2e/newQuestion.cy.js | client/cypress/component/new_question.cy.js    | server/tests/newQuestion.test.js |
| SEARCH FOR EXISTING POSTS | Query the questions on the platform based on the content of their title/description, or based on their tags. Filter results by active/newest/unanswered | client/cypress/e2e/search.cy.js | client/cypress/component/header.cy.js   | server/tests/question.test.js |
| COMMENT ON POST - add answer | Logged-in user can provide an answer to an existing question on the forum by posting a detailed response to a specific question. The new answer is then displayed on the question's page | client/cypress/e2e/newAnswer.cy.js | client/cypress/component/new_answer.cy.js  | server/tests/newAnswer.test.js   |
| VOTE ON POST | Logged-in users with enough reputation points (which is awarded by user's content receiving upvotes) can upvote/downvote a question or answer to indicate the usefullness, quality, or relevance of the post | client/cypress/e2e/vote.cy.js | client/cypress/component/answer_page.cy.js  | server/tests/vote.test.js AND server/tests/voteUtils.test.js   |
| TAGGING POSTS | Logged-in user can tag a new question with up to 5 relevant tags that describe the topic of the question. Users can update tags of a question they asked by editing the question | client/cypress/e2e/tags.cy.js | client/cypress/component/tag_page.cy.js AND client/cypress/component/question_page.cy.js  | server/tests/tags.test.js AND server/tests/question.test.js   |
| USER PROFILE - registration | Unregistered users can create a new account to become active member and make contributions to the platform, including asking a question, answering a question, and voting on questions/answers. Upon successful registration, user's information is added to the database, with a hashed password | client/cypress/e2e/userRegistration.cy.js | client/cypress/component/register.cy.js  | server/tests/user.test.js   |
| USER PROFILE - authentication | Registered user can log in to the application with their email address and password to personalize their profile, see all questions/answers they contributed, ask a question, answer existing questions,and vote on questions/answers. Upon authentication, a session cookie is created by the server, which stores the session ID. This session ID is inaccessible to client-side scripts | client/cypress/e2e/userLogin.cy.js | client/cypress/component/login.cy.js  | server/tests/user.test.js AND server/tests/unauthenticatedUser.test.js   |
| USER PROFILE - profile updates | Registered user profile that provides personalized information about logged-in user and their contributions to the platform, including their asked questions, posted answers, any tags they've participated in, any votes cast, and gives the option to edit/delete their personal information and their questions/answers | client/cypress/e2e/userProfile.cy.js AND client/cypress/e2e/editUserProfile.cy.js | client/cypress/component/user_profile_page.cy.js  | server/tests/user.test.js  |
| POST MODERATION | Allows logged-in site moderators to review and manage individual questions and answers on the platform that have been flagged. A question/answer is automatically flagged for review if its vote count reaches -15. Upon being flagged, the question/answer must be reviewed by a moderator where it can be reset (vote count reset to 0, flag removed) if it is, in fact, helpful/useful content, or deleted from the website if is deemed unhelpful or irrelevant | client/cypress/e2e/postModeration.cy.js | client/cypress/component/post_moderation.cy.js  | server/tests/postModeration.test.js AND server/tests/nonAdminUser.test.js   |
| EDIT POST | Logged-in user can edit any questions or answers they contributed to the platform. Update question title/description/tags, or update answer text | client/cypress/e2e/editQuestionAnswer.cy.js  | client/cypress/component/user_profile_page.cy.js    | server/tests/editQuestionAnswer.test.js   |
| DELETE POST | Logged-in user can delete any questions or answers they contributed to the platform. Deleted content no longer appears on the platform, and user's aggregated contributions are updated accordingly | client/cypress/e2e/deleteQuestionAnswer.cy.js | client/cypress/component/user_profile_page.cy.js    | server/tests/deleteQuestionAnswer.test.js   |
|-----------|-----------------|----------------|-----------------|----------------|


## Instructions for using our application 

All dependencies are included in our `pacakge-lock.json` and `package.json` files within the project repository. To interact with the application from your local host, you can run the following:

```
cd client/ npm install
cd client/ npm start
cd ..
cd server/ npm install
node destroy.js     # in case any remnants from previous run/testing
node init.js        # populate database with test data
node server.js      
```

Then navigate to "http://localhost:3000/" and the application should be running. 

Alternatively, you can deploy the application from Docker.

You can find our test data in the file `server/init.js`, but below is the login credentials for our test users:
- { email: john@email.com, password: WXYZ123 } (not enough reputation to vote)
- { email: betty@yahoo.com, password: ABCD876 }
- { email: sammy@email.com, password: GHJK543 } (* moderator)
- { email: dd@email.com, password: TEST1234 }

## Instructions to generate and view coverage report 

In order to generate and view our code coverage report for our jest tests, you can run the following commands in the terminal from our root folder:

```
cd server/
npx jest --coverage

open coverage/lcov-report/index.html
```

This will open the report in a browser. 