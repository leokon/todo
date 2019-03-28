import React from 'react';
import Helpers from '../helpers.js';
import Auth from '../auth.js';
import requireAuth from './RequireAuth.js';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tasks: [],
            tags: [],
            error: null
        };

        this.handleLogout = this.handleLogout.bind(this);
        this.Auth = new Auth();
    }

    componentWillMount() {
        this.fetchInitialData();
    }

    /**
     * Fetch complete task and tag state for the currently authenticated user, populate state.
     */
    async fetchInitialData() {
        try {
            let tasks = await Helpers.fetch('/api/tasks', {
                method: 'GET'
            });
            this.setState({tasks: tasks});

            let tags = await Helpers.fetch('/api/tags', {
                method: 'GET'
            });
            this.setState({tags: tags});
        } catch (error) {
            if (error.response.status === 401) {
                this.props.history.replace('/login');
            } else if (error.response.status === 400) {
                // error in response, display could not load error message
                this.setState({error: true});
            }
        }
    }

    handleLogout() {
        this.Auth.logout();
        this.props.history.replace('/login');
    }

    render() {
        return (
            <div>
                <div>Base app entry point component</div>
                <button onClick={this.handleLogout}>Logout</button>
                {this.state.error &&
                    <div>Error: could not load tasks.</div>
                }
            </div>
        );
    }
}

export default requireAuth(App);



// TODO: authentication
    // if user is not logged in (no token in local storage), show them the login page
    // if user is logged in (token found in local storage), use it to make requests, fetch data and display logged in app
    // if a request fails due to invalid token, remove the token from local storage and show user the login page
    // if user clicks on a register button, show them the register page
