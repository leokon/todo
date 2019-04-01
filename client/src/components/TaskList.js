import React from 'react';
import {
    DragDropContext,
    Droppable,
    Draggable
} from 'react-beautiful-dnd';
import Helpers from '../helpers.js';
import Task from './Task.js';

/**
 * Represents a list of tasks, with drag and drop functionality.
 */
class TaskList extends React.Component {
    constructor(props) {
        super(props);

        this.onDragEnd = this.onDragEnd.bind(this);
    }

    /**
     * Handles tasks being moved, makes server request and notifies parent to update state via event callback
     * Fails silently on request failure, allows user to move tasks around locally.
     */
    async onDragEnd(result) {
        if (!result.destination) {
            return;
        }
        if (result.destination.index === result.source.index) {
            return;
        }

        this.props.handleTaskMoved(result.source.index, result.destination.index);

        let movingTask = this.props.tasks[result.source.index];
        await Helpers.fetch(`/api/tasks/${movingTask.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                position: result.destination.index
            })
        });
    }

    render() {
        if (this.props.error) {
            return (
                <div>Error: could not load tasks.</div>
            );
        } else {
            // filter tags in the list based on specified filter tags
            let filteredTasks = this.props.tasks.filter((task) => {
                for (let filterTag of this.props.filterTags) {
                    // if this filter tag isn't in the current task's tags, don't allow it
                    if (!(task.tags.some((tag) => (tag.id === filterTag.id)))) {
                        return false;
                    }
                }

                return true;
            });

            return (
                <DragDropContext onDragEnd={this.onDragEnd}>
                    <Droppable droppableId='droppable'>
                        {(provided, snapshot) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                {filteredTasks.map((task, index) => {
                                    return (
                                        <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={this.props.filterTags.length > 0} >
                                            {(provided, snapshot) => (
                                                <Task
                                                    key={task.id}
                                                    task={task}
                                                    innerRef={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                />
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            );
        }
    }
}

export default TaskList;