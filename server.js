// load environment variables from .env file into process.env
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const jwt = require('jsonwebtoken');
const passport = require('passport');
const JWTStrategy = require('./auth.js').JWTStrategy;

const User = require('./models/user.js');
const Task = require('./models/task.js');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
passport.use(JWTStrategy);

// routes
/**
 * Registration route that creates a user.
 */
app.post('/register', async (req, res) => {
    let email = req.body.email.toLowerCase();
    let password = req.body.password;

    let user = await User.create(email, password);
    if (!user) {
        res.status(400).json({message: 'User account could not be created.'});
    } else {
        res.status(200).json({message: 'Registration successful.', user: user.id});
    }
});

/**
 * Login route that authenticates based on email and password and returns a JWT token for future authentication.
 */
app.post('/login', async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    let user = await User.authenticate(email, password);
    if (!user) {
        res.status(401).json({message: 'Authentication failed.'});
    } else {
        let token = jwt.sign({email}, process.env.JWT_SECRET);
        return res.status(200).json({message: 'ok', token: token});
    }
});


/**
 * Get the list of all tasks for the currently authenticated user.
 */
app.get('/api/tasks', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let currentUser = req.user;

    let tasks = await Task.getByUser(currentUser.id);
    if (tasks) {
        return res.status(200).json(tasks);
    } else {
        return res.status(400).json({message: 'Could not retrieve tasks list.'});
    }
});

/**
 * Create a new task for the currently authenticated user.
 */
app.post('/api/tasks', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let currentUser = req.user;
    let content = req.body.content;
    let tags = req.body.tags;

    let position = await Task.getNextPositionByUserId(currentUser.id);
    let task = await Task.create(currentUser.id, content, position, false);

    if (task) {
        return res.status(200).json(task);
    } else {
        return res.status(400).json({message: 'Could not create task.'});
    }
});


// start server
app.listen(port, () => console.log(`Listening on port ${port}...`));