const db = require('../db.js');

/**
 * Creates a new tag. If it already exists, silently return it as if it was created.
 */
async function create(tag) {
    try {
        // create or retrieve tag
        let result = await db.one(
            'INSERT INTO tags (user_id, name) VALUES ($1, $2) ON CONFLICT (user_id, name) DO NOTHING RETURNING *',
            [tag.user_id, tag.name]
        );

        if (result) {
            return result;
        } else {
            // tag already exists, fetch and return it
            return await db.one(
                'SELECT * FROM tags WHERE user_id = $1 AND name = $2',
                [tag.user_id, tag.name]
            );
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

/**
 * Links the given tag to the given task.
 */
async function link(tag, taskId) {
    try {
        return await db.one(
            'INSERT INTO tagmap (task_id, tag_id) VALUES ($1, $2) RETURNING *',
            [taskId, tag.id]
        );
    } catch (error) {
        console.log(error);
        return null;
    }
}

module.exports = {
    create,
    link
};