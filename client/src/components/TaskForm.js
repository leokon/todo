import React from 'react';
import CreatableSelect from 'react-select/lib/Creatable';
import styled from 'styled-components';

import Helpers from "../helpers";

const Container = styled.div`
    display: flex;
`;

const StyledSelect = styled(CreatableSelect)`
    flex-grow: 1;
`;

class TaskForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            content: '',
            selectedOptions: [],
            error: null
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleTagChange = this.handleTagChange.bind(this);
    }

    /**
     * Handles changes to task form values
     */
    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    /**
     * Handles selected tag state updates and creation of new draft tags from react-select component, locally only.
     */
    handleTagChange(newValue, meta) {
        if (meta.action === 'create-option') {
            let addedValue = newValue.slice(-1)[0];
            let tag = {name: addedValue.value};
            this.props.handleDraftTagCreated(tag);
        }

        this.setState({selectedOptions: newValue});
    }

    /**
     * Handles new task creation, takes data from form and makes server request, updates state
     */
    async handleSubmit(event) {
        event.preventDefault();

        try {
            let createdTask = await Helpers.fetch('/api/tasks', {
                method: 'POST',
                body: JSON.stringify({
                    content: this.state.content,
                    tags: this.state.selectedOptions.map((option) => ({name: option.value}))
                })
            });

            if (createdTask) {
                // success, update parent state with created task via event callback and reset form
                this.props.handleTaskCreated(createdTask);

                this.setState({content: '', selectedOptions: [], error: null});
            } else {
                this.setState({error: true})
            }
        } catch (error) {
            this.setState({error: error});
        }
    }

    render() {
        return (
            <Container>
                <div>
                    <form onSubmit={this.handleSubmit}>
                        <input type="text" name="content" value={this.state.content} onChange={this.handleChange} />
                        <input type="submit" value="Submit" />
                    </form>

                    {this.state.error &&
                    <div>Error: could not create task.</div>
                    }
                </div>

                <StyledSelect
                    isMulti
                    value={this.state.selectedOptions}
                    options={this.props.draftTags.map(tag => ({label: tag.name, value: tag.name}))}
                    onChange={this.handleTagChange}
                />
            </Container>
        );
    }
}

export default TaskForm;