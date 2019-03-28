import React from 'react';

import Auth from '../auth.js';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {email: '', password: '', error: null};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.Auth = new Auth();
    }

    componentWillMount() {
        if (this.Auth.isUserAuthenticated()) {
            this.props.history.replace('/');
        }
    }

    handleChange(event) {
        console.log(event.target.name, event.target.value);
        this.setState({[event.target.name]: event.target.value});
    }

    async handleSubmit(event) {
        event.preventDefault();

        // make an API request to login endpoint
        try {
            // login successful, redirect to full app
            await this.Auth.login(this.state.email, this.state.password);
            this.props.history.replace('/');
        } catch (error) {
            // login failed, display error on login form
            this.setState({
                error: error
            });
        }

        console.log(this.state.email, this.state.password);
    }

    render() {
        return (
            <div>
                Login Form
                {this.state.error &&
                    <div>Invalid login details.</div>
                }
                <form onSubmit={this.handleSubmit}>
                    <input type="email" name="email" value={this.state.email} onChange={this.handleChange} />
                    <input type="password" name="password" value={this.state.password} onChange={this.handleChange} />
                    <input type="submit" value="Submit" />
                </form>
            </div>
        );
    }
}

export default Login;