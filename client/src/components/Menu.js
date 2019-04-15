import React from 'react';
import styled from 'styled-components';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck, faTasks, faChartBar, faPlus} from '@fortawesome/free-solid-svg-icons/index';

import Helpers from '../helpers.js';
import Views from '../views.js';
import Tag from './Tag.js';

const MenuContainer = styled.div`
    flex-basis: 220px;
    display: flex;
    flex-direction: column;
`;

const Navigation = styled.div`
    border-bottom: 1px solid #c7c7c7;
    padding-bottom: 20px;
    margin-bottom: 20px;
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

const MinorText = styled.span`
    font-size: 12px;
    color: #8a8a8a;
    padding-left: 8px;
`;

const TagHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 15px;
    
    & span {
        font-weight: bold;
    }
    
    & svg {
        cursor: pointer;
        
        transition: transform .3s ease-in-out;
        transform: ${(props) => (props.displayTagForm ? 'rotate(45deg)' : 'none')};
    }
`;

const TagForm = styled.div`
    padding-bottom: 5px;
    
    & input {
        margin-right: 8px;
    }
    
    & svg {
        cursor: pointer;
    }
`;

const TagList = styled.div`
    display: flex;
    flex-direction: column;
    
    & span {
        margin-top: 2px;
        margin-bottom: 2px;
    }
`;

class Menu extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedIndexes: [],
            selectedTags: [],
            name: '',
            error: null,
            displayTagForm: false
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleTagSubmit = this.handleTagSubmit.bind(this);
        this.handleTagClick = this.handleTagClick.bind(this);
    }

    async handleClick(newView) {
        this.props.handleViewChange(newView);
    }

    handleInputChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    handleKeyDown(event) {
        if (event.key === 'Enter') {
            this.handleTagSubmit();
        }
    }

    /**
     * Handles clicks on tags in menu, selects or deselects it based on state and propagates change to parent
     */
    async handleTagClick(tag, index) {
        if (this.state.selectedIndexes.includes(index)) {
            await this.setState({
                selectedIndexes: this.state.selectedIndexes.filter((i) => (i !== index)),
                selectedTags: this.state.selectedTags.filter((t) => (t.id !== tag.id))
            });
        } else {
            await this.setState({
                selectedIndexes: [...this.state.selectedIndexes, index],
                selectedTags: [...this.state.selectedTags, tag]
            });
        }

        this.props.handleFilterTagsChanged(this.state.selectedTags);
    }

    async handleTagSubmit() {
        try {
            let createdTag = await Helpers.fetch('/api/tags', {
                method: 'POST',
                body: JSON.stringify({
                    name: this.state.name
                })
            });

            if (createdTag) {
                this.props.handleTagCreated(createdTag);
                this.setState({name: '', displayTagForm: false});
            } else {
                this.setState({error: true});
            }
        } catch (error) {
            this.setState({error: error});
        }
    }

    render() {
        return (
            <MenuContainer>
                <Navigation>
                    <MenuItem selected={this.props.currentView === Views.tasks} onClick={() => (this.handleClick(Views.tasks))}>
                        <FontAwesomeIcon icon={faTasks} />
                        <span>Tasks</span>
                        <MinorText>{this.props.tasks.filter((task) => (!task.completed)).length}</MinorText>
                    </MenuItem>
                    <MenuItem selected={this.props.currentView === Views.completed} onClick={() => (this.handleClick(Views.completed))}>
                        <FontAwesomeIcon icon={faCheck} />
                        <span>Completed</span>
                    </MenuItem>
                    <MenuItem selected={this.props.currentView === Views.statistics} onClick={() => (this.handleClick(Views.statistics))}>
                        <FontAwesomeIcon icon={faChartBar} />
                        <span>Statistics</span>
                    </MenuItem>
                </Navigation>

                <div>
                    <TagHeader displayTagForm={this.state.displayTagForm}>
                        <span>Tags</span>
                        <FontAwesomeIcon icon={faPlus} onClick={() => {this.setState({displayTagForm: !this.state.displayTagForm});}}/>
                    </TagHeader>

                    {this.state.displayTagForm &&
                        <TagForm>
                            <input type="text" name="name" value={this.state.name} onChange={this.handleInputChange} onKeyDown={this.handleKeyDown}/>
                            <FontAwesomeIcon icon={faCheck} onClick={this.handleTagSubmit} />
                        </TagForm>
                    }

                    <TagList>
                        {this.props.tags.map((tag, index) => (
                            <Tag
                                key={tag.id}
                                tag={tag}
                                selected={this.state.selectedIndexes.includes(index)}
                                onClick={() => this.handleTagClick(tag, index)}
                            />
                        ))}
                    </TagList>
                </div>
            </MenuContainer>
        );
    }
}

export default Menu;