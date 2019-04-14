import React from 'react';
import styled from 'styled-components';

import Helpers from '../helpers.js';
import Task from './Task.js';

const Card = styled.div`
    box-shadow: 0px 2px 3px 0px rgba(0,0,0,0.2);
    margin-top: 25px;
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 12px 10px;
    background-color: #1595ad;
    color: #FAFAFA;
`;

const CardDate = styled.div`
    font-size: 18px;
    font-weight: bold;
`;

const CardCounter = styled.div``;

const EmptyStateContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 250px;
`;

class CompletedTaskList extends React.Component {
    constructor(props) {
        super(props);
    }

    /**
     * Generates blocks of tasks grouped by date completed. Returns an object containing two arrays, one with group dates, and another
     * with the tasks.
     * @returns {{blockDates: Array, taskBlocks: Array}}
     */
    generateTaskBlocks(tasks) {
        let taskBlocks = [];
        let blockDates = [];
        let blockIndex = -1;
        let currentBlockDate = null;
        for (let task of this.props.tasks) {
            let taskDate = new Date(task.completed_at);

            if (!(Helpers.isSameDay(currentBlockDate, taskDate))) {
                // start new block
                currentBlockDate = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
                blockDates.push(currentBlockDate);
                blockIndex++;
                taskBlocks[blockIndex] = [];
            }

            taskBlocks[blockIndex].push(task);
        }

        return {
            blockDates,
            taskBlocks
        };
    }

    render() {
        let filteredTasks = this.props.tasks.filter((task) => {
            for (let filterTag of this.props.filterTags) {
                // if this filter tag isn't in the current task's tags, don't allow it
                if (!(task.tags.some((tag) => (tag.id === filterTag.id)))) {
                    return false;
                }
            }

            return true;
        });

        let {blockDates, taskBlocks} = this.generateTaskBlocks(filteredTasks);

        return (
            <React.Fragment>
                {this.props.tasks.length > 0 ? (
                    <div>
                        {blockDates.map((date, index) => {
                            return (
                                <Card key={index}>
                                    <CardHeader>
                                        <CardDate>
                                            {`${Helpers.getDayofWeekName(date)} ${Helpers.getMonthName(date)} ${date.getDate()}, ${date.getFullYear()}`}
                                        </CardDate>
                                        <CardCounter>
                                            Completed {taskBlocks[index].length} task{taskBlocks[index].length > 1 ? 's' : ''}
                                        </CardCounter>
                                    </CardHeader>

                                    {taskBlocks[index].map((task, index) => (
                                        <Task
                                            key={index}
                                            task={task}
                                            editable={false}
                                            handleDeleteTask={this.props.handleDeleteTask}
                                        />
                                    ))}
                                </Card>
                            );
                        })}

                    </div>
                ) : (
                    <EmptyStateContainer>You haven't completed any tasks yet. 🙁</EmptyStateContainer>
                )}
            </React.Fragment>
        );
    }
}

export default CompletedTaskList;