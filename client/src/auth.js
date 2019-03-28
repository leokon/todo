import Helpers from './helpers.js';

class Auth {
    constructor() {
        this.login = this.login.bind(this);
    }

    /**
     * Logs in a user with the given email and password, stores the resulting token if sucessful, otherwise throws an error.
     */
    async login(email, password) {
        let response = await Helpers.fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password
            })
        });

        this.storeToken(response.token);
    }

    /**
     * Register a user with the given email and password. Automatically logs the user in if success, otherwise throws an error.
     */
    async register(email, password) {
        try {
            let response = await Helpers.fetch('/api/register', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password
                })
            });

            await this.login(email, password);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Check if the current user is authenticated based on whether there is a stored token.
     */
    isUserAuthenticated() {
        let token = this.getToken();
        return token !== null && token !== undefined;
    }

    /**
     * Store a JWT authentication token locally.
     */
    storeToken(token) {
        localStorage.setItem('token', token);
    }

    /**
     * Retrieve the stored JWT token.
     */
    getToken() {
        return localStorage.getItem('token');
    }

    /**
     * Remove the stored JWT authentication token from local storage.
     */
    logout() {
        localStorage.removeItem('token');
    }
}

export default Auth;