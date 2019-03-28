import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Link
} from 'react-router-dom';
import App from './components/App.js';
import Login from './components/Login.js';

ReactDOM.render(
    <Router>
        <Switch>
            <Route path='/' exact component={App} />
            <Route path='/login' exact component={Login} />
        </Switch>
    </Router>,
    document.getElementById('root')
);