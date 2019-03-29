import React from 'react';
import {
    DragDropContext,
    Droppable,
    Draggable
} from 'react-beautiful-dnd';
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
     * Handles tasks being moved, notifies parent to update state and make server request via an event callback
     */
    onDragEnd(result) {
        if (!result.destination) {
            return;
        }
        if (result.destination.index === result.source.index) {
            return;
        }

        this.props.handleTaskMoved(result.source.index, result.destination.index);
    }

    render() {
        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId='droppable'>
                    {(provided, snapshot) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {this.props.tasks.map((task, index) => {
                                return (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
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

export default TaskList;