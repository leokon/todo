import React from 'react';
import CreatableSelect from 'react-select/lib/Creatable';
import styled from 'styled-components';
import onClickOutside from 'react-onclickoutside';

import Helpers from "../helpers";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
`;

const FormContainer = styled.div`
    display: flex;
    flex-direction: row;
    margin-bottom: 3px;
    font-size: 16px;
`;

const StyledForm = styled.form`
    flex-basis: 65%;
`;

const StyledSelect = styled(CreatableSelect)`
    flex-basis: 35%;
`;

const TaskInput = styled.input`
    width: 100%;
    height: 100%;
    max-height: 38px;    
    box-sizing: border-box;
    border: 1px solid #cdcdcd;
    padding-top: 2px;
    padding-bottom: 2px;
    padding-left: 8px;
    padding-right: 8px;
    font-size: 16px;
`;

const SubmitButton = styled.button`
    flex-basis: 35px;
    max-height: 35px;
    max-width: 90px;
    background-color: #1595AD;
    color: #FAFAFA;
    border: none;
    font-family: 'Roboto', sans-serif;
    font-weight: bold;
    cursor: pointer;
`;

const selectStyles = {
    control: (provided) => ({
        ...provided,
        borderRadius: '0',
        fontFamily: 'Roboto, sans-serif'
    })
};


class TaskForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            content: '',
            selectedOptions: [],
            focused: false,
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

        if (this.state.content === '') {
            return;
        }

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

                this.setState({content: '', selectedOptions: [], focused: false, error: null});
            } else {
                this.setState({error: true})
            }
        } catch (error) {
            this.setState({error: error});
        }
    }

    handleClickOutside(event) {
        this.setState({
            focused: false
        });
    }

    render() {
        return (
            <Container onClick={() => {this.setState({focused: true});}}>
                <FormContainer>
                    <StyledForm onSubmit={this.handleSubmit}>
                        <TaskInput type="text" name="content" placeholder="Add a task..." value={this.state.content} onChange={this.handleChange} />
                    </StyledForm>

                    <StyledSelect
                        isMulti
                        value={this.state.selectedOptions}
                        options={this.props.draftTags.map(tag => ({label: tag.name, value: tag.name}))}
                        onChange={this.handleTagChange}
                        placeholder="Select a tag..."
                        styles={selectStyles}
                    />
                </FormContainer>

                {this.state.focused &&
                    <SubmitButton type="submit" onClick={this.handleSubmit}>Submit</SubmitButton>
                }

                {this.state.error &&
                    <div>Error: could not create task.</div>
                }
            </Container>
        );
    }
}

export default onClickOutside(TaskForm);