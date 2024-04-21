// Setup database with initial test data.

let Tag = require('./models/tags')
let Answer = require('./models/answers')
let Question = require('./models/questions')
let User = require('./models/users')
let Vote = require('./models/votes')

const mongoose = require("mongoose");

const { MONGO_URL } = require("./config");

mongoose.connect(MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true});

let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

function tagCreate(name) {
    let tag = new Tag({ name: name });
    return tag.save();
}


// We added vote_count, question_status, and flag
// need to change this to take references to User objects instead of asked_by String,
function questionCreate(title, text, tags, answers, asked_by, ask_date_time, views, vote_count, flag, question_status) {
    let qstndetail = {
        title: title,
        text: text,
        tags: tags,
        asked_by: asked_by,
        vote_count: vote_count,
        flag: flag,
        question_status: question_status
        // vote_count and flag has default values, do we have to add them?
    }
    if (answers != false) qstndetail.answers = answers;
    if (ask_date_time != false) qstndetail.ask_date_time = ask_date_time;
    if (views != false) qstndetail.views = views;

    let qstn = new Question(qstndetail);
    return qstn.save();
}

// we added vote_count and flag, but gave both default init. values
function answerCreate(text, ans_by, ans_date_time, vote_count, flag, qid) {
    let answerdetail = {
        text:text,
        vote_count: vote_count, 
        flag: flag,
        question: qid,
    };
    if (ans_by != false) answerdetail.ans_by = ans_by;
    if (ans_date_time != false) answerdetail.ans_date_time = ans_date_time;

    let answer = new Answer(answerdetail);
    return answer.save();
}


// need to add a function userCreate(...)
function userCreate(first_name, last_name, email, hashed_password, display_name, about_me, location, reputation, account_creation_date_time, is_moderator) {
    let userDetail = {
        first_name: first_name, 
        last_name: last_name,
        email: email,
        password: hashed_password,
        display_name: display_name, 
        about_me: about_me,
        location: location, 
        reputation: reputation,
        is_moderator: is_moderator
    }
    if (account_creation_date_time != false) userDetail.account_creation_date_time = account_creation_date_time;

    let user = new User(userDetail);
    return user.save();
}

function voteCreate(user, referenceId, onModel, voteType) {
    let vote = new Vote({
                            user: user,
                            referenceId: referenceId,
                            onModel: onModel,
                            voteType: voteType
                        });
    return vote.save();
}

const init = async () => {
    console.log('insert test data into the database')
    // create user objects
    // initialized them all with no questions/answers/tags, can go back and add more Question/Answer objects to the database
    let u1 = await userCreate('John', 'Doe', 'john@email.com', 'WXYZ123', 'johnny_d', 'Im new here', 'USA', 1, new Date('2023-03-22T21:17:53'), false);
    let u2 = await userCreate('Betty', 'Jones', 'betty@yahoo.com', 'ABCD876', 'betty_j', '', '', 15, new Date('2020-08-31T20:16:53'), false);
    let u3 = await userCreate('Sammy', 'Smith', 'sammy@email.com', 'GHJK543', 'sammysmith', 'Memorized every leetcode question ever', 'Basement', 15, new Date('2019-11-15T22:19:53'), true);
    let u4 = await userCreate('Dax', 'Davis', 'dd@email.com', 'TEST1234', 'dd', 'Big Reputation', 'On Tour', 100, new Date('2016-08-31T20:16:53'), false);

    let t1 = await tagCreate('react');
    let t2 = await tagCreate('javascript');
    let t3 = await tagCreate('android-studio');
    let t4 = await tagCreate('shared-preferences');
    let t5 = await tagCreate('storage');
    let t6 = await tagCreate('website');
    let t7 = await tagCreate('flutter'); t7

    // set the q1 and q2 vote_count according to below vote objects
    let q1 = await questionCreate('Programmatically navigate using React router', 'the alert shows the proper index for the li clicked, and when I alert the variable within the last function Im calling, moveToNextImage(stepClicked), the same value shows but the animation isnt happening. This works many other ways, but Im trying to pass the index value of the list item clicked to use for the math to calculate.', [t1, t2], [], u2, new Date('2022-01-20T03:00:00'), 10, 1, false);
    let q2 = await questionCreate('android studio save string shared preference, start activity and load the saved string', 'I am using bottom navigation view but am using custom navigation, so my fragments are not recreated every time i switch to a different view. I just hide/show my fragments depending on the icon selected. The problem i am facing is that whenever a config change happens (dark/light theme), my app crashes. I have 2 fragments in this activity and the below code is what i am using to refrain them from being recreated.', [t3, t4, t2], [], u2, new Date('2023-01-10T11:24:30'), 121, -1, false);
    let q3 = await questionCreate('Object storage for a web application', 'I am currently working on a website where, roughly 40 million documents and images should be served to its users. I need suggestions on which method is the most suitable for storing content with subject to these requirements.', [t5, t6], [], u3, new Date('2023-02-18T01:02:15'), 200, false);
    let q4 = await questionCreate('Quick question about storage on android', 'I would like to know the best way to go about storing an array on an android phone so that even when the app/activity ended the data remains', [t3, t4, t5], [], u3, new Date('2023-03-10T14:28:01'), 103, false);
    let q5 = await questionCreate('Best pizza in Boston?', 'Not technical but maybe someone has a good rec', [t7], [], u1, new Date('2023-04-14T21:17:53'), 20, -16, true); // post moderation test flag changes when vote_count < -15

    // set the a1 and a2 vote_count according to the below vote objects
    let a1 = await answerCreate('React Router is mostly a wrapper around the history library. history handles interaction with the browser\'s window.history for you with its browser and hash histories. It also provides a memory history which is useful for environments that don\'t have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.', u2, new Date('2023-11-20T03:24:42'), 1,false, q1._id);
    let a2 = await answerCreate('On my end, I like to have a single history object that I can carry even outside components. I like to have a single history.js file that I import on demand, and just manipulate it. You just have to change BrowserRouter to Router, and specify the history prop. This doesn\'t change anything for you, except that you have your own history object that you can manipulate as you want. You need to install history, the library used by react-router.', u3, new Date('2023-11-23T08:24:00'), -1, false, q1._id);
    let a3 = await answerCreate('Consider using apply() instead; commit writes its data to persistent storage immediately, whereas apply will handle it in the background.', u2, new Date('2023-11-18T09:24:00'), 10,false, q2._id);
    let a4 = await answerCreate('YourPreference yourPrefrence = YourPreference.getInstance(context); yourPreference.saveData(YOUR_KEY,YOUR_VALUE);', u2, new Date('2023-11-12T03:30:00'), -10,false, q2._id);
    let a5 = await answerCreate('I just found all the above examples just too confusing, so I wrote my own. ', u3, new Date('2023-11-01T15:24:19'),100,false,  q2._id);
    let a6 = await answerCreate('Storing content as BLOBs in databases.', u2, new Date('2023-02-19T18:20:59'),-14, false, q3._id);
    let a7 = await answerCreate('Using GridFS to chunk and store content.', u2, new Date('2023-02-22T17:19:00'),25, false,  q3._id);
    let a8 = await answerCreate('Store data in a SQLLite database.', u3, new Date('2023-03-22T21:17:53'),-5, false, q4._id);
    let a9 = await answerCreate('Blah blah blah blah blah', u3, new Date('2023-03-19T21:17:53'), -15, true, q4._id); // post moderation


    await Question.findByIdAndUpdate(q1._id,  { $push: { answers: { $each: [a1._id, a2._id] } } });
    await Question.findByIdAndUpdate(q2._id,  { $push: { answers: { $each: [a3._id, a4._id, a5._id] } } });
    await Question.findByIdAndUpdate(q3._id,  { $push: { answers: { $each: [a6._id, a7._id] } } });
    await Question.findByIdAndUpdate(q4._id, { $push: { answers: { $each: [a8._id, a9._id] } } });


    // Create votes
    await voteCreate(u4._id, q1._id, 'Question', 'upvote');
    await voteCreate(u4._id, q2._id, 'Question', 'downvote');
    await voteCreate(u4._id, a1._id, 'Answer', 'upvote');
    await voteCreate(u4._id, a2._id, 'Answer', 'downvote');

    if (db) db.close();
    console.log("done");
};

init().catch((err) => {
    console.log("ERROR: " + err);
    if (db) db.close();
});

console.log("processing ...");
