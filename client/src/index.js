import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter as Router,
    Route,
    Switch,
} from 'react-router-dom';
import App from './components/App.js';
import Login from './components/Login.js';
import Register from './components/Register.js';

ReactDOM.render(
    <Router>
        <Switch>
            <Route path='/' exact component={App} />
            <Route path='/login' exact component={Login} />
            <Route path='/register' exact component={Register} />
        </Switch>
    </Router>,
    document.getElementById('root')
);