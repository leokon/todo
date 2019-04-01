const _ = require('underscore');
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
            // for each new tag that doesnt exist in existing tags, create the link
            for (let tag of task.tags) {
                let found = false;
                for (let current of existingTask.tags) {
                    if (current.id === tag.id) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    let result = await Tag.link(tag, task.id);
                    if (!result) {
                        return null;
                    }
                }
            }

            // for each existing tag that doesnt exist in new tags, delete the link
            for (let tag of existingTask.tags) {
                let found = false;
                for (let current of task.tags) {
                    if (current.id === tag.id) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    await db.none(
                        'DELETE FROM tagmap WHERE task_id = $1 AND tag_id = $2',
                        [task.id, tag.id]
                    );
                }
            }


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
                'UPDATE tasks SET user_id = $1, content = $2, position = $3, completed = $4, completed_at = $5 WHERE id = $6 RETURNING *',
                [task.user_id, task.content, task.position, task.completed, task.completed_at, existingTask.id]
            );
        } else {
            // task doesn't already exist, create
            return await db.one(
                'INSERT INTO tasks (user_id, content, position, completed, completed_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [task.user_id, task.content, task.position, task.completed, task.completed_at]
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