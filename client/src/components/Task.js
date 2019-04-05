import React from 'react';
import onClickOutside from 'react-onclickoutside';
import Select from 'react-select';
import styled from 'styled-components';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash} from '@fortawesome/free-solid-svg-icons';

import Helpers from '../helpers.js';
import Tag from './Tag.js';

const Container = styled.div`
    display: flex;
    align-items: center;
    background-color: #FAFAFA;
    margin-top: 4px;
    margin-bottom: 4px;
    
    box-shadow: ${(props) => props.editing ? '0px 2px 7px -3px rgba(0,0,0,0.75)' : 'none'};
    
    &:hover, &:focus, &:active {
        box-shadow: 0px 2px 7px -3px rgba(0,0,0,0.75);
    }
    
    animation: ${props => props.animateComplete ? 'slide-out-right 0.6s cubic-bezier(0.550, 0.085, 0.680, 0.530) 1s both' : 'none'};
    
    @keyframes slide-out-right {
        0% {
            transform: translateX(0);
            opacity: 1;
        }
        100% {
            transform: translateX(1000px);
            opacity: 0;
        }
    }
`;

const ContentContainer = styled.div`
    flex-basis: 40%;
    padding-top: 1.1rem;
    padding-bottom: 1.1rem;
    padding-left: 1rem;
    
    &:hover {
        cursor: text;
    }
`;

const TagContainer = styled.div`
    display: flex;
    flex-grow: 1;
`;

const StyledSelect = styled(Select)`
    flex-grow: 1;
`;

const CompleteIconContainer = styled.div`
    padding: 0.8rem;
    border-right: 2px solid white;
`;

const CompleteIcon = styled.svg`
    cursor: pointer;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: block;
    stroke-width: 2;
    stroke: #FAFAFA;
    stroke-miterlimit: 10;
    box-shadow: inset 0px 0px 2px #1595AD;
    animation: ${props => props.animateComplete ? 'fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .8s both' : 'none'};
    
    & .circle {
        stroke-dasharray: 166;
        stroke-dashoffset: 166;
        stroke-width: 2;
        stroke-miterlimit: 10;
        stroke: #1595AD;
        fill: none;
        animation: ${props => props.animateComplete ? 'stroke .5s cubic-bezier(0.650, 0.000, 0.450, 1.000) forwards' : 'none'};
    }
    
    &.path {
        transform-origin: 50% 50%;
        stroke-dasharray: 48;
        stroke-dashoffset: 48;
        animation: ${props => props.animateComplete ? 'stroke .3s cubic-bezier(0.650, 0.000, 0.450, 1.000) forwards' : 'none'};
    }
    
    @keyframes stroke {
        100% {
            stroke-dashoffset: 0;
        }
    }
    
    @keyframes scale {
        0%, 100% {
            transform: none;
        }
        50% {
            transform: scale3d(1.2, 1.2, 1);
        }
    }
    
    @keyframes fill {
        100% {
            box-shadow: inset 0px 0px 0px 30px #1595AD;
        }
    }
`;

const DeleteIcon = styled.div`
    align-self: center;
    padding: 0px 18px;
    cursor: pointer;
`;

/**
 * Represents a single todo task and associated controls.
 * Allows editing of task content, marking as completed, and deletion.
 */
class Task extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editing: false,
            selectedOptions: [],
            animateComplete: false
        };

        this.deleteTask = this.deleteTask.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleCompleteClick = this.handleCompleteClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
    }

    /**
     * Make server request to delete task and notify parent to update local state
     */
    async deleteTask(event) {
        try {
            event.stopPropagation();

            await Helpers.fetch(`/api/tasks/${this.props.task.id}`, {
                method: 'DELETE'
            });

            this.props.handleDeleteTask(this.props.task);
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Click handler for entire Task component, manages editing state
     */
    async handleClick(event) {
        event.stopPropagation();

        if (!this.state.editing) {
            await this.setState({
                editing: true,
                selectedOptions: this.props.task.tags.map((tag) => ({label: tag.name, value: tag.name}))
            });

            this.contentElement.focus();
        }
    }

    /**
     * Click handler for complete task button, sends request to server and triggers a state update
     */
    async handleCompleteClick(event) {
        event.stopPropagation();

        this.setState({
            animateComplete: true
        });

        try {
            let completedTask = await Helpers.fetch(`/api/tasks/${this.props.task.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    completed: 'true'
                })
            });

            setTimeout(() => {this.props.handleTaskCompleted(completedTask)}, 1500);
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Handler for clicks outside the task.
     */
    async handleClickOutside(event) {
        if (this.state.editing) {
            await this.setState({
                editing: false
            });

            this.saveChanges();
        }
    }

    handleChange(newValue) {
        this.setState({
            selectedOptions: newValue
        });
    }

    /**
     * Save all changes made to task content and tags, send to server and update parent state via callback
     */
    async saveChanges() {
        // get data from content and tags fields, make server requests to save, use callback to update parent state
        let newContent = this.contentElement.textContent;

        try {
            let updatedTask = await Helpers.fetch(`/api/tasks/${this.props.task.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    content: newContent,
                    tags: this.state.selectedOptions.map((option) => ({name: option.value}))
                })
            });

            if (updatedTask) {
                this.props.handleUpdateTask(updatedTask);
            }
        } catch (error) {
            console.log(error);
        }
    }

    render() {
        return (
            <Container
                {...this.props}
                editing={this.state.editing}
                animateComplete={this.state.animateComplete}
                ref={this.props.innerRef}
                onClick={this.handleClick}
                onMouseEnter={() => {this.setState({hovering: true})}}
                onMouseLeave={() => {this.setState({hovering: false})}}
            >
                <CompleteIconContainer>
                    <CompleteIcon viewBox="0 0 52 52" animateComplete={this.state.animateComplete} onClick={this.handleCompleteClick}>
                        <circle className="circle" cx="26" cy="26" r="25" fill="none" />
                        <path className="path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                    </CompleteIcon>
                </CompleteIconContainer>

                <ContentContainer
                    contentEditable={this.state.editing}
                    ref={(domNode) => {this.contentElement = domNode;}}
                >
                    {this.props.task.content}
                </ContentContainer>

                {this.state.editing ? (
                    <StyledSelect
                        isMulti
                        options={this.props.tags.map(tag => ({label: tag.name, value: tag.name}))}
                        defaultValue={this.props.task.tags.map(tag => ({label: tag.name, value: tag.name}))}
                        onChange={this.handleChange}
                    />
                ) : (
                    <TagContainer>
                        {this.props.task.tags.map((tag) => (
                            <Tag
                                key={tag.id}
                                tag={tag}
                            />
                        ))}
                    </TagContainer>
                )}

                {(this.state.hovering || this.state.editing || this.props.isDragging) &&
                    <DeleteIcon>
                        <FontAwesomeIcon icon={faTrash} size="lg" onClick={this.deleteTask} />
                    </DeleteIcon>
                }
            </Container>
        );
    }
}

export default onClickOutside(Task);

// TODO:
    // completed button icon, tick w/ animation, AND the actual completion logic and state handling
    // styling, borders around tasks to make it look like the table on FA site

    // need to actually switch task content to a real text input when editing, dont use contenteditable. looks better, more control over
// both cursor position and styles
    // can potentially reuse the TaskForm component, but the issue is styles, since they're defined in the taskform component, how would
// we change the sizing. or would we? why dont we just make the little taskforms look the same as the main one

    // box shadows and/or change background colour on task editing
        // maybe box shadow on hover, background change on focus/edit. like google tasks