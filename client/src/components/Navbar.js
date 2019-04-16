import React from 'react';
import {Link} from 'react-router-dom';
import styled from 'styled-components';
import onClickOutside from 'react-onclickoutside';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCog, faSignOutAlt} from '@fortawesome/free-solid-svg-icons/index';

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
    width: 55%;
`;

const Logo = styled(Link)`
    font-family: 'Kristi', cursive;
    font-size: 38px;
    color: #FAFAFA;
    margin: 0;
    text-decoration: none;
`;

const SettingsIconContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    
    & svg {
        color: white;
        font-size: 21px;
        cursor: pointer;
    }
`;

const SettingsDropdown = styled.div`
    position: absolute;
    left: 0;
    top: 50px;
    padding-top: 5px;
    padding-bottom: 5px;
    width: 200px;
    z-index: 2;
    
    display: flex;
    justify-content: left;
    background-color: white;
    cursor: normal;
    border: 1px solid #e1e1e1;
    border-top: none;
`;

const DropdownItem = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: 10px;
    color: black;
    cursor: pointer;
    
    & svg {
        font-size: 16px;
        color: black;
        padding-right: 6px;
    }
    
    &:hover {
        background-color: #FAFAFA;
    }
`;

const DropdownItemText = styled.span`
    margin-top: 2px;
`;

const DropdownTriangle = styled.div`
    position: absolute;
    top: -8px;
    left: 5px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 8px solid white;
`;

class Navbar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dropdownOpen: false
        };

        this.handleDropdownClick = this.handleDropdownClick.bind(this);
        this.handleLogout = this.handleLogout.bind(this);

        this.Auth = new Auth();
    }

    handleDropdownClick() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    handleClickOutside() {
        this.setState({
            dropdownOpen: false
        });
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
                        <React.Fragment>
                            <SettingsIconContainer>
                                <FontAwesomeIcon icon={faCog} onClick={this.handleDropdownClick} />

                                {this.state.dropdownOpen &&
                                    <SettingsDropdown>
                                        <DropdownItem onClick={this.handleLogout}>
                                            <FontAwesomeIcon icon={faSignOutAlt} />
                                            <DropdownItemText>Log out</DropdownItemText>
                                        </DropdownItem>

                                        <DropdownTriangle />
                                    </SettingsDropdown>
                                }
                            </SettingsIconContainer>


                        </React.Fragment>
                    }
                </Content>
            </Container>
        );
    }
}

export default onClickOutside(Navbar);