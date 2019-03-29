import React from 'react';
import Helpers from "../helpers";

class TaskForm extends React.Component {
    constructor(props) {
        super(props);

        this.initialState = {
            content: '',
            tags: [],
            error: null
        };
        this.state = this.initialState;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
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
                    tags: this.state.tags
                })
            });

            // success, update parent state with created task via event callback
            if (createdTask) {
                this.props.handleTaskCreated(createdTask);

                this.setState(this.initialState);
            } else {
                this.setState({error: true})
            }
        } catch (error) {
            this.setState({error: error});
        }
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <input type="text" name="content" value={this.state.content} onChange={this.handleChange} />
                    <input type="submit" value="Submit" />
                </form>

                {this.state.error &&
                    <div>Error: could not create task.</div>
                }
            </div>
        );
    }
}

export default TaskForm;