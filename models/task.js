const db = require('../db.js');
const Tag = require('./tag.js');

/**
 * Saves a task object to the database. Updates an existing task if it already exists based on ID, otherwise creates it.
 * Returns null on errors.
 */
async function save(task) {
    let existingTask = null;
    if (task.id) {
        existingTask = await getById(task.id);
    }

    try {
        if (existingTask) {
            // task already exists, update
            // if position is being changed, change the positions of all of this user's other tasks to match
            if (task.position > existingTask.position) {
                // moving to a higher position number
                db.none(
                    'UPDATE tasks SET position = position - 1 WHERE user_id = $1 AND position > $2 AND position <= $3',
                    [existingTask.user_id, existingTask.position, task.position]
                );
            } else if (task.position < existingTask.position) {
                // moving to a lower position number
                db.none(
                    'UPDATE tasks SET position = position + 1 WHERE user_id = $1 AND position >= $2 AND position < $3',
                    [existingTask.user_id, task.position, existingTask.position]
                );
            }

            return await db.one(
                'UPDATE tasks SET user_id = $1, content = $2, position = $3, completed = $4 WHERE id = $5 RETURNING *',
                [task.user_id, task.content, task.position, task.completed, existingTask.id]
            );
        } else {
            // task doesn't already exist, create
            return await db.one(
                'INSERT INTO tasks (user_id, content, position, completed) VALUES ($1, $2, $3, $4) RETURNING *',
                [task.user_id, task.content, task.position, task.completed]
            );
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

/**
 * Gets a single task by its unique ID if it exists, otherwise returns null.
 */
async function getById(taskId) {
    try {
        let task = await db.one('SELECT * FROM tasks WHERE id = $1', [taskId]);
        if (task) {
            // fetch associated tags
            task.tags = await Tag.getTagsByTask(task);
            return task;
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

/**
 * Gets an array of all tasks for the given user if exists, otherwise returns null.
 */
async function getByUser(userId) {
    try {
        let taskArray = await db.any('SELECT * FROM tasks WHERE user_id = $1 ORDER BY position', [userId]);
        if (taskArray) {
            // fetch associated tags
            let outputArray = [];
            for (let task of taskArray) {
                task.tags = await Tag.getTagsByTask(task);
                outputArray.push(task);
            }
            return outputArray;
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

/**
 * Finds the next position for a task to be inserted, based on the existing task positions for the given user.
 */
async function getNextPositionByUserId(userId) {
    try {
        let oldPosition = await db.one('SELECT MAX(position) FROM tasks WHERE user_id = $1', [userId]);
        if (oldPosition.max === null) {
            return 0;
        } else {
            return (oldPosition.max + 1);
        }
    } catch (error) {
        console.log(error);
        return 0;
    }
}


module.exports = {
    save,
    getById,
    getByUser,
    getNextPositionByUserId
};