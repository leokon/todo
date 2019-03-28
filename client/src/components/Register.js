import React from 'react';
import Auth from '../auth.js';

class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.Auth = new Auth();
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    async handleSubmit(event) {
        event.preventDefault();

        // make an API request to register endpoint
        try {
            // registration successful, redirect to full app
            await this.Auth.register(this.state.email, this.state.password);
            this.props.history.replace('/');
        } catch (error) {
            // register failed, display error on registration form
            this.setState({
                error: error
            });
        }
    }

    render() {
        return (
            <div>
                Register Form
                {this.state.error &&
                    <div>Invalid registration details.</div>
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

export default Register;