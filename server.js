// load environment variables from .env file into process.env
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const db = require('./db.js');
const User = require('./models/user.js');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// routes
/**
 * Registration route that creates a user.
 */
app.post('/register', async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    let user = await User.create(email, password);
    if (!user) {
        res.status(400).json({message: 'User account could not be created.'});
    } else {
        res.status(200).json({message: 'Registration successful.', user: user});
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



// start server
app.listen(port, () => console.log(`Listening on port ${port}...`));