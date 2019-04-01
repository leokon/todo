import React from 'react';
import Tag from './Tag.js';

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
                <div>{this.props.task.content}</div>
                <div>
                    {this.props.task.tags.map((tag) => (
                        <Tag
                            key={tag.id}
                            tag={tag}
                        />
                    ))}
                </div>
            </div>
        );
    }
}

export default Task;