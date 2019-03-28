import React from 'react';
import Auth from '../auth.js';

/**
 * Higher order component that only allows access to wrapped component if user is authenticated, otherwise redirects to login.
 */
export default function requireAuth(ComposedComponent) {
    let AuthService = new Auth();

    return class AuthenticatedComponent extends React.Component {
        constructor() {
            super();
            this.state = {
                isAuthenticated: false,
                user: null
            };
        }

        componentWillMount() {
            if (!AuthService.isUserAuthenticated()) {
                this.props.history.replace('/login');
            } else {
                this.setState({
                    isAuthenticated: true
                });
            }
        }

        render() {
            if (this.state.isAuthenticated) {
                return (
                    <ComposedComponent history={this.props.history} user={this.state.user} />
                );
            } else {
                return null;
            }
        }
    };
}