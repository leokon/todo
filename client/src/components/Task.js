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
`;

const ContentContainer = styled.div`
    flex-basis: 30%;
    padding-top: 1rem;
    padding-bottom: 1rem;
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
`;

const DeleteIcon = styled.div`
    align-self: center;
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
                        <FontAwesomeIcon icon={faTrash} onClick={this.deleteTask} />
                    </DeleteIcon>
                }
            </Container>
        );
    }
}

export default onClickOutside(Task);