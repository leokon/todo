import React from 'react';
import styled from 'styled-components';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck, faTag, faTasks, faChartBar} from '@fortawesome/free-solid-svg-icons/index';

import Views from '../views.js';

const MenuContainer = styled.div`
    flex-basis: 220px;
    display: flex;
    flex-direction: column;
`;

const MenuItem = styled.div`
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 10px;
    border-left: 4px solid transparent;
    cursor: pointer;

    & svg {
        padding-right: 15px;
    }
    
    &:hover {
        // border-left: 4px solid #1595ad;
        color: #1595ad;
    }
    
    border-left: ${props => props.selected ? '4px solid #1595ad' : '4px solid transparent'};
    color: ${props => props.selected ? '#1595ad': ''};
`;

class Menu extends React.Component {

    constructor(props) {
        super(props);
    }

    async handleClick(newView) {
        this.props.handleViewChange(newView);
    }

    render() {
        return (
            <MenuContainer>
                <MenuItem selected={this.props.currentView === Views.tasks} onClick={() => (this.handleClick(Views.tasks))}>
                    <FontAwesomeIcon icon={faTasks} />
                    Tasks
                </MenuItem>
                <MenuItem selected={this.props.currentView === Views.completed} onClick={() => (this.handleClick(Views.completed))}>
                    <FontAwesomeIcon icon={faCheck} />
                    Completed
                </MenuItem>
                <MenuItem>
                    <FontAwesomeIcon icon={faChartBar} />
                    Statistics
                </MenuItem>
            </MenuContainer>
        );
    }
}

export default Menu;