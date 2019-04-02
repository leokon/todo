import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash} from '@fortawesome/free-solid-svg-icons';

import Helpers from '../helpers.js';
import Tag from './Tag.js';

/**
 * Represents a single todo task and associated controls.
 * Allows editing of task content, marking as completed, and deletion.
 */
class Task extends React.Component {
    constructor(props) {
        super(props);

        this.deleteTask = this.deleteTask.bind(this);
    }

    handleAddTag() {
        console.log('add tag');
    }

    /**
     * Make server request to delete task and notify parent to update local state
     */
    async deleteTask() {
        try {
            await Helpers.fetch(`/api/tasks/${this.props.task.id}`, {
                method: 'DELETE'
            });

            this.props.handleDeleteTask(this.props.task);
        } catch (error) {
            console.log(error);
        }
    }

    render() {
        return (
            <div {...this.props} ref={this.props.innerRef}>
                <div>{this.props.task.content}</div>
                <div>
                    {this.props.task.tags.map((tag) => (
                        <Tag
                            key={tag.id}
                            tag={tag}
                        />
                    ))}
                </div>

                <div className="task-delete">
                    <FontAwesomeIcon icon={faTrash} onClick={this.deleteTask} />
                </div>
            </div>
        );
    }
}

export default Task;