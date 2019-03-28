import React from 'react';
import Helpers from '../helpers.js';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {error: null};
    }

    componentWillMount() {
        this.fetchInitialData();
    }

    async fetchInitialData() {
        try {
            console.log('fetching inital data');
            let tasks = await Helpers.fetch('/api/tasks', {
                method: 'GET',
            });
            console.log(tasks);
        } catch (error) {
            if (error.response.status === 401) {
                this.props.history.replace('/login');
            } else if (error.response.status === 400) {
                // error in response, display could not load error message
                this.setState({error: true});
            }
        }
    }

    render() {
        return (
            <div>
                <div>Base app entry point component</div>
                {this.state.error &&
                    <div>Error: could not load tasks.</div>
                }
            </div>
        );
    }
}

export default App;



// TODO: authentication
    // if user is not logged in (no token in local storage), show them the login page
    // if user is logged in (token found in local storage), use it to make requests, fetch data and display logged in app
    // if a request fails due to invalid token, remove the token from local storage and show user the login page
    // if user clicks on a register button, show them the register page
