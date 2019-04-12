import React from 'react';
import {Link} from 'react-router-dom';
import styled from 'styled-components';

import Auth from '../auth';

const Container = styled.div`
    display: flex;
    justify-content: center;
    height: 50px;
    width: 100%;
    background-color: #1595AD;
`;

const Content = styled.div`
    display: flex;
    justify-content: space-between;
    width: 60%;
`;

const Logo = styled(Link)`
    font-family: 'Kristi', cursive;
    font-size: 38px;
    color: #FAFAFA;
    margin: 0;
    text-decoration: none;
`;

const LogoutButton = styled.button`
    align-self: center;
`;

class Navbar extends React.Component {
    constructor(props) {
        super(props);

        this.handleLogout = this.handleLogout.bind(this);

        this.Auth = new Auth();
    }

    handleLogout() {
        this.Auth.logout();
        this.props.history.replace('/login');
    }

    render() {
        return (
            <Container>
                <Content>
                    <Logo to='/'>Doozle</Logo>

                    {this.Auth.isUserAuthenticated() &&
                        <LogoutButton onClick={this.handleLogout}>Logout</LogoutButton>
                    }
                </Content>
            </Container>
        );
    }
}

export default Navbar;