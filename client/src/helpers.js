import Auth from './auth.js';

class Helpers {
    /**
     * Wrapper around fetch builtin, applies json and authorization headers, checks response status. Returns response JSON.
     */
    static async fetch(url, options) {
        let AuthService = new Auth();

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        if (AuthService.isUserAuthenticated()) {
            headers['Authorization'] = `Bearer ${AuthService.getToken()}`
        }

        let response = await fetch(url, {
            headers,
            ...options
        });
        this.checkResponseStatus(response);
        return await response.json();
    }

    /**
     * Checks the status of a fetch request response, throws an error containing the original response object if it is not a success.
     */
    static checkResponseStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            let error = new Error(response.statusText);
            error.response = response;
            throw error;
        }
    }

    /**
     * Checks if two Dates are on the same day.
     */
    static isSameDay(d1, d2) {
        try {
            return (
                d1.getFullYear() === d2.getFullYear() &&
                d1.getMonth() === d2.getMonth() &&
                d1.getDate() === d2.getDate()
            );
        } catch (error) {
            return false;
        }
    }

    static getDayofWeekName(date) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        return days[date.getDay()];
    }

    static getMonthName(date) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[date.getMonth()];
    }
}

export default Helpers;