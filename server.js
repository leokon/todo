// load environment variables from .env file into process.env
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const jwt = require('jsonwebtoken');
const passport = require('passport');
const JWTStrategy = require('./auth.js').JWTStrategy;

const User = require('./models/user.js');
const Task = require('./models/task.js');
const Tag = require('./models/tag.js');

const app = express();
const port = process.env.PORT;

app.use('/static', express.static(path.join(__dirname, 'client', 'build'), {fallthrough: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
passport.use(JWTStrategy);

// API routes
/**
 * Registration route that creates a user.
 */
app.post('/api/register', async (req, res) => {
    let email = req.body.email.toLowerCase();
    let password = req.body.password;

    let user = await User.create(email, password);
    if (!user) {
        return res.status(400).json({message: 'User account could not be created.'});
    } else {
        return res.status(200).json({message: 'Registration successful.', user: user.id});
    }
});

/**
 * Login route that authenticates based on email and password and returns a JWT token for future authentication.
 */
app.post('/api/login', async (req, res) => {
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
    let task = await Task.save({
        user_id: currentUser.id,
        content: content,
        position: position,
        completed: false
    });

    if (task) {
        if (tags) {
            // create tags if any and link them to this task
            for (let currentTag of tags) {
                currentTag.user_id = currentUser.id;
                let tag = await Tag.createOrRetrieve(currentTag);
                if (tag) {
                    await Tag.link(tag, task.id);
                }
            }
        }

        // add tags to task response object
        task.tags = await Tag.getTagsByTask(task);

        return res.status(200).json(task);
    } else {
        return res.status(400).json({message: 'Could not create task.'});
    }
});

/**
 * Update the given task with the given data, if valid.
 * Used for moving the position of a task, marking as complete/not complete, etc.
 */
app.put('/api/tasks/:taskId', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let currentUser = req.user;
    let taskId = req.params.taskId;

    let task = await Task.getById(taskId);
    if (task && task.user_id === currentUser.id) {
        // parameter validation
        if (req.body.content !== undefined) {
            task.content = req.body.content;
        }

        if (req.body.position !== undefined) {
            if (req.body.position > await Task.getNextPositionByUserId(currentUser.id) - 1 || req.body.position < 0) {
                return res.status(400).json({message: 'Invalid task position.'});
            } else {
                task.position = req.body.position;
            }
        }

        if (req.body.completed !== undefined) {
            if (req.body.completed !== 'true' && req.body.completed !== 'false') {
                return res.status(400).json({message: 'Invalid completion status.'});
            } else {
                task.completed = req.body.completed;
                task.completed_at = new Date().toISOString();
            }
        }

        if (req.body.tags !== undefined) {
            task.tags = req.body.tags;
        }


        let updatedTask = await Task.save(task);
        if (updatedTask) {
            if (task.tags) {
                // create tags if any and link them to this task
                for (let currentTag of task.tags) {
                    currentTag.user_id = currentUser.id;
                    let tag = await Tag.createOrRetrieve(currentTag);
                    if (tag) {
                        await Tag.link(tag, updatedTask.id);
                    }
                }
            }

            // add tags to task response object
            updatedTask.tags = await Tag.getTagsByTask(task);

            return res.status(200).json(updatedTask);
        } else {
            return res.status(400).json({message: 'Task could not be updated.'});
        }
    } else {
        return res.status(400).json({message: 'Invalid task ID.'});
    }
});

app.delete('/api/tasks/:taskId', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let currentUser = req.user;
    let taskId = req.params.taskId;

    let task = await Task.getById(taskId);
    if (task && task.user_id === currentUser.id) {
        await Task.remove(task);
        return res.status(200).json({message: 'Task deleted.'});
    } else {
        return res.status(400).json({message: 'Task could not be deleted.'});
    }
});

/**
 * Get the list of all tags for the currently authenticated user.
 */
app.get('/api/tags', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let currentUser = req.user;

    let tags = await Tag.getByUser(currentUser.id);
    if (tags) {
        return res.status(200).json(tags);
    } else {
        return res.status(400).json({message: 'Could not retrieve tags list.'});
    }
});

/**
 * Create a new tag for the current user, not linked to any task.
 */
app.post('/api/tags', passport.authenticate('jwt', {session: false}), async (req, res) => {
     let currentUser = req.user;
     let tag = await Tag.create({
         user_id: currentUser.id,
         name: req.body.name
     });

     if (tag) {
         return res.status(200).json(tag);
     } else {
         return res.status(400).json({message: 'Could not create tag.'});
     }
});

/**
 * Delete a tag based on the given ID for the current user.
 */
app.delete('/api/tags/:tagId', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let currentUser = req.user;
    let tagId = req.params.tagId;

    let result = await Tag.remove({
        id: tagId,
        user_id: currentUser.id
    });
    if (result) {
        return res.status(200).json({message: 'Successfully deleted tag.'});
    } else {
        return res.status(400).json({message: 'Could not delete tag.'});
    }
});


// base routes
/**
 * Serve the frontend React single page application entry point file.
 * Wildcard match, so that all client side routing URLs that are not already explicitly defined are served the entry point file.
 */
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});


// start server
app.listen(port, () => console.log(`Listening on port ${port}...`));