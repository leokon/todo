import React from 'react';
import {
    DragDropContext,
    Droppable,
    Draggable
} from 'react-beautiful-dnd';
import styled from 'styled-components';

import Helpers from '../helpers.js';
import Task from './Task.js';

const EmptyStateContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 250px;
`;

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

        let movingTask = this.props.tasks[result.source.index];
        let localDestinationTask = this.props.tasks[result.destination.index];
        let sourceIndex = this.props.fullTasks.findIndex((task) => (task.id === movingTask.id));
        let destIndex = this.props.fullTasks.findIndex((task) => (task.id === localDestinationTask.id));

        this.props.handleTaskMoved(sourceIndex, destIndex);
        await Helpers.fetch(`/api/tasks/${movingTask.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                position: destIndex
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
                <React.Fragment>
                    {(() => {
                        if (this.props.tasks.length === 0 && this.props.fullTasks.filter((task) => (task.completed)).length > 0) {
                            // user has at least 1 completed task, display congratulations empty state
                            return (
                                <EmptyStateContainer>Congratulations! You've completed all your tasks.</EmptyStateContainer>
                            );
                        } else if (this.props.tasks.length === 0 && this.props.fullTasks.filter((task) => (task.completed)).length === 0) {
                            // user has no completed tasks, display intro empty state
                            return (
                                <EmptyStateContainer>You don't have any tasks. Create one and it'll show up here!</EmptyStateContainer>
                            );
                        } else if (filteredTasks.length === 0 && this.props.filterTags.length > 0) {
                            // user has no tasks matching the current tag filters, display a message notifying them
                            return (
                                <EmptyStateContainer>You don't have any tasks matching those tags.</EmptyStateContainer>
                            );
                        } else {
                            // user has uncompleted tasks, display them
                            return (
                                <DragDropContext onDragEnd={this.onDragEnd}>
                                    <Droppable droppableId='droppable'>
                                        {(provided, snapshot) => (
                                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                                {filteredTasks.map((task, index) => {
                                                    return (
                                                        <Draggable
                                                            key={task.id}
                                                            draggableId={task.id}
                                                            index={index}
                                                            isDragDisabled={this.props.filterTags.length > 0 || !this.props.draggable}
                                                        >
                                                            {(provided, snapshot) => (
                                                                <Task
                                                                    key={task.id}
                                                                    task={task}
                                                                    tags={this.props.tags}
                                                                    editable={true}
                                                                    handleDeleteTask={this.props.handleDeleteTask}
                                                                    handleUpdateTask={this.props.handleUpdateTask}
                                                                    handleTaskCompleted={this.props.handleTaskCompleted}
                                                                    innerRef={provided.innerRef}
                                                                    isDragging={snapshot.isDragging}
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
                    })()}
                </React.Fragment>
            );
        }
    }
}

export default TaskList;

// TODO:
    // add dumb celebration congrats emoji to empty state, either small inline with text or large empty state style