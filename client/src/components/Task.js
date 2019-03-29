import React from 'react';

/**
 * Represents a single todo task and associated controls.
 * Allows editing of task content, marking as completed, and deletion.
 */
class Task extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div {...this.props} ref={this.props.innerRef}>
                {this.props.task.content}
            </div>
        );
    }
}

export default Task;