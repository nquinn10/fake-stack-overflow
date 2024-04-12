// Application server

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require('express-session');
const MongoStore = require('connect-mongo');


const { MONGO_URL, port, CLIENT_URL } = require("./config");

mongoose.connect(MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true});

const app = express();
app.use(
    cors({
             credentials: true,
             origin: [CLIENT_URL],
         })
);

app.use(express.json());

const sessionStore = MongoStore.create({ mongoUrl: MONGO_URL });

// Configure session middleware
app.use(session({
    secret: 'your_secret_key', // replace this with a secret key in our production environment
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        secure: true, // Set to false if not using HTTPS
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true,
        sameSite: true
    }
}));

app.get("/", (_, res) => {
    res.send("Fake SO Server Dummy Endpoint");
    res.end();
});

const questionController = require("./controller/question");
const tagController = require("./controller/tag");
const answerController = require("./controller/answer");
const userController = require("./controller/user");

app.use("/question", questionController);
app.use("/tag", tagController);
app.use("/answer", answerController);
app.use("/user", userController);

let server = app.listen(port, () => {
    console.log(`Server starts at http://localhost:${port}`);
});

process.on("SIGINT", () => {
    server.close();
    mongoose.disconnect();
    console.log("Server closed. Database instance disconnected");
    process.exit(0);
});

module.exports = { server, sessionStore };
