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
    // border-top: 2px solid white;
    // border-bottom: 2px solid white;
    margin-top: 4px;
    margin-bottom: 4px;
    
    box-shadow: ${(props) => props.editing ? '0px 2px 7px -3px rgba(0,0,0,0.75)' : 'none'};
    
    &:hover, &:focus, &:active {
        box-shadow: 0px 2px 7px -3px rgba(0,0,0,0.75);
    }
`;

const ContentContainer = styled.div`
    flex-basis: 30%;
    padding-top: 1rem;
    padding-bottom: 1rem;
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

const CompleteIcon = styled.div`
    padding: 1rem;
    border-right: 2px solid white;
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
            selectedOptions: []
        };

        this.deleteTask = this.deleteTask.bind(this);
        this.handleClick = this.handleClick.bind(this);
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
                ref={this.props.innerRef}
                onClick={this.handleClick}
                onMouseEnter={() => {this.setState({hovering: true})}}
                onMouseLeave={() => {this.setState({hovering: false})}}
            >
                <CompleteIcon>
                    C
                </CompleteIcon>

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