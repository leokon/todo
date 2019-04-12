import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter as Router,
    Route,
    Switch,
} from 'react-router-dom';
import {createGlobalStyle} from 'styled-components';

import App from './components/App.js';
import Login from './components/Login.js';
import Register from './components/Register.js';

const GlobalStyle = createGlobalStyle`
    body {
        font-family: 'Roboto', sans-serif;
        background-color: #f7f7f7;
        color: #222222;
        margin: 0;
        box-sizing: border-box;
    }
`;

ReactDOM.render(
    <React.Fragment>
        <Router>
            <Switch>
                <Route path='/' exact component={App} />
                <Route path='/login' exact component={Login} />
                <Route path='/register' exact component={Register} />
            </Switch>
        </Router>
        <GlobalStyle />
    </React.Fragment>,
    document.getElementById('root')
);