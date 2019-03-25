const bcrypt = require('bcryptjs');
const db = require('../db.js');


/**
 * Creates a new user and returns the user object if successful.
 */
async function create(email, password) {
    try {
        let hash = await bcrypt.hash(password, 10);
        return await db.one('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *', [email, hash]);
    } catch (error) {
        console.log(error);
        return null;
    }
}

/**
 * Gets a single user by email address if it exists, otherwise return null.
 */
async function getByEmail(email) {
    try {
        return await db.one('SELECT * FROM users WHERE email = $1', [email]);
    } catch (error) {
        console.log(error);
        return null;
    }
}

/**
 * Authenticates a user based on email address and plaintext password, returns the user object if successful, otherwise null.
 */
async function authenticate(email, password) {
    let user = await getByEmail(email);
    if (!user) {
        return null;
    } else {
        try {
            let compare = await bcrypt.compare(password, user.password);
            if (compare) {
                return user;
            }
        } catch (error) {
            console.log(error);
        }
    }

    return null;
}

module.exports = {
    create,
    getByEmail,
    authenticate
};