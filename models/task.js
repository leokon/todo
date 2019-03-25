const db = require('../db.js');

/**
 * Creates a new task and returns the task object if successful.
 */
async function create(userId, content, position, completed) {
    try {
        return await db.one(
            'INSERT INTO tasks (user_id, content, position, completed) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, content, position, completed]
        );
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
        return await db.any('SELECT * FROM tasks WHERE user_id = $1', [userId]);
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
    create,
    getByUser,
    getNextPositionByUserId
};