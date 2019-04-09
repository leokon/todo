import React from 'react';
import styled from 'styled-components';
import _ from 'underscore';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';

import Helpers from '../helpers.js';
import Auth from '../auth.js';
import requireAuth from './RequireAuth.js';
import TaskList from './TaskList.js';
import CompletedTaskList from './CompletedTaskList.js';
import TaskForm from './TaskForm.js';
import TagList from './TagList.js';

const OuterContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const NavbarContainer = styled.div`
    display: flex;
    justify-content: center;
    height: 50px;
    width: 100%;
    background-color: #1595AD;
`;

const Navbar = styled.div`
    display: flex;
    justify-content: space-between;
    width: 50%;
`;

const Logo = styled.h1`
    font-family: 'Kristi', cursive;
    font-size: 38px;
    color: #FAFAFA;
    margin: 0;
`;

const LogoutButton = styled.button`
    align-self: center;
`;

const AppContainer = styled.div`
    width: 50%;
    background-color: #FFFFFF;
    border: 1px solid #CDCDCD;
    padding-left: 25px;
    padding-right: 25px;
    margin-top: 20px;
`;

const UndoPrompt = styled.div`
    position: fixed;
    bottom: 0;
    left: 0;
    margin: 24px;
    padding: 24px;
    background-color: black;
    color: #FAFAFA;
    box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.4);

    & > svg {
        cursor: pointer;
    }
`;

const UndoPromptText = styled.span`
    margin-right: 25px;
    font-size: 15px;
`;

const UndoPromptButton = styled.span`
    text-transform: uppercase;
    color: #1595ad;
    font-weight: bold;
    cursor: pointer;
    margin-right: 28px;
`;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tasks: [],
            tags: [],
            draftTags: [],
            filterTags: [],
            currentTasksView: true,
            undoContent: null,
            undoType: null,
            confirmDelete: true,
            error: null
        };

        this.handleLogout = this.handleLogout.bind(this);
        this.handleTaskCreated = this.handleTaskCreated.bind(this);
        this.handleTaskMoved = this.handleTaskMoved.bind(this);
        this.handleTaskCompleted = this.handleTaskCompleted.bind(this);
        this.handleTagCreated = this.handleTagCreated.bind(this);
        this.handleDraftTagCreated = this.handleDraftTagCreated.bind(this);
        this.handleFilterTagsChanged = this.handleFilterTagsChanged.bind(this);
        this.handleDeleteTask = this.handleDeleteTask.bind(this);
        this.handleUpdateTask = this.handleUpdateTask.bind(this);
        this.handleUndoComplete = this.handleUndoComplete.bind(this);
        this.handleUndoDelete = this.handleUndoDelete.bind(this);
        this.handleRejectUndo = this.handleRejectUndo.bind(this);
        this.Auth = new Auth();
    }

    componentWillMount() {
        this.fetchInitialData();
    }

    /**
     * Fetch complete task and tag state for the currently authenticated user, populate state.
     */
    async fetchInitialData() {
        try {
            let tasks = await Helpers.fetch('/api/tasks', {
                method: 'GET'
            });
            this.setState({tasks: tasks});

            let tags = await Helpers.fetch('/api/tags', {
                method: 'GET'
            });
            this.setState({tags: tags, draftTags: tags});
        } catch (error) {
            if (error.response.status === 401) {
                this.props.history.replace('/login');
            } else if (error.response.status === 400) {
                // error in response, display could not load error message
                this.setState({error: error});
            }
        }
    }

    /**
     * Updates task and tag array state in response to a new task being created.
     */
    async handleTaskCreated(task) {
        this.setState({tasks: [task, ...this.state.tasks]});

        // merge this task's tags into state, without creating duplicates
        this.setState({
            tags: _.uniq(_.union(this.state.tags, task.tags), false, _.property('id'))
        });
    }

    /**
     * Updates task state in response to task position being changed.
     */
    async handleTaskMoved(fromIndex, toIndex) {
        // update tasks array so that the task at fromIndex is now at toIndex, shuffling the other tasks respectively
        let tasks = Array.from(this.state.tasks);
        let [movingTask] = tasks.splice(fromIndex, 1);
        tasks.splice(toIndex, 0, movingTask);

        for (let i = 0; i < tasks.length; i++) {
            tasks[i].position = i;
        }

        this.setState({tasks: tasks});
    }

    /**
     * Updates task state in response to
     */
    async handleTaskCompleted(completedTask) {
        let tasksCopy = Array.from(this.state.tasks);
        let updateIndex = tasksCopy.findIndex((task) => (task.id === completedTask.id));
        tasksCopy[updateIndex] = completedTask;

        this.setState({
            tasks: tasksCopy,
            undoContent: completedTask,
            undoType: 'completed'
        });

        let undoTimer = setTimeout(() => {
            this.setState({undoContent: null, undoType: null});
        }, 5000);

        this.setState({
            undoTimer: undoTimer
        });
    }

    /**
     * Updates tag state in response to a new tag being created.
     */
    async handleTagCreated(tag) {
        this.setState({
            tags: [...this.state.tags, tag],
            draftTags: [...this.state.draftTags, tag]
        });
    }

    /**
     * Updates draft tag array state in response to a new draft tag being created.
     */
    async handleDraftTagCreated(tag) {
        this.setState({draftTags: [...this.state.draftTags, tag]});
    }

    /**
     * Updates filter tag state in response to a change in filter tags selected.
     */
    async handleFilterTagsChanged(selectedTags) {
        this.setState({filterTags: selectedTags});
    }

    /**
     * Updates task array state in response to a task being deleted.
     */
    async handleDeleteTask(task) {
        let removeIndex = this.state.tasks.findIndex((t) => (task.id === t.id));

        let oldTasks = Array.from(this.state.tasks);
        let newTasks = this.state.tasks.concat();
        newTasks.splice(removeIndex, 1);

        // provisional update of state to reflect deletion before request has been sent
        await this.setState({
            tasks: newTasks,
            undoContent: oldTasks,
            undoType: 'deleted'
        });

        // if undo button has been pressed, don't send deletion request and revert state instead
        let undoTimer = setTimeout(async () => {
            if (this.state.confirmDelete) {
                await Helpers.fetch(`/api/tasks/${task.id}`, {
                    method: 'DELETE'
                });
            } else {
                await this.setState({
                    tasks: this.state.undoContent,
                });
            }

            await this.setState({
                undoContent: null,
                undoType: null,
                confirmDelete: true
            });
        }, 5000);

        this.setState({
            undoTimer: undoTimer
        });
    }

    /**
     * Updates task array state in response to a task being updated.
     */
    handleUpdateTask(updatedTask) {
        let tasksCopy = Array.from(this.state.tasks);
        let updateIndex = tasksCopy.findIndex((task) => (task.id === updatedTask.id));
        tasksCopy[updateIndex] = updatedTask;

        this.setState({
            tasks: tasksCopy
        });
    }

    /**
     * Handles undoing completion of a task, makes a request to mark the task as uncompleted and updates state.
     */
    async handleUndoComplete() {
        try {
            let uncompletedTask = await Helpers.fetch(`/api/tasks/${this.state.undoContent.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    completed: 'false'
                })
            });

            let tasksCopy = Array.from(this.state.tasks);
            let updateIndex = tasksCopy.findIndex((task) => (task.id === uncompletedTask.id));
            tasksCopy[updateIndex] = uncompletedTask;
            this.setState({
                tasks: tasksCopy,
                undoContent: null,
                undoType: null
            });
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Handles undoing deletion of a task. Sets a flag to stop deletion request from being sent after undo timeout finishes, and updates
     * state to reflect the task not being deleted.
     */
    handleUndoDelete() {
        this.setState({
            confirmDelete: false,
            tasks: this.state.undoContent,
            undoType: null
        });
    }

    /**
     * Handles a user closing the undo prompt, resets state
     */
    handleRejectUndo() {
        this.setState({
            undoContent: null,
            undoType: null
        });

        clearTimeout(this.state.undoTimer);
    }

    handleLogout() {
        this.Auth.logout();
        this.props.history.replace('/login');
    }

    render() {
        return (
            <React.Fragment>
                <OuterContainer>
                    <NavbarContainer>
                        <Navbar>
                            <Logo>Doozle</Logo>

                            <LogoutButton onClick={this.handleLogout}>Logout</LogoutButton>
                        </Navbar>
                    </NavbarContainer>

                    <AppContainer>
                        <TaskForm
                            {...this.props}
                            tags={this.state.tags}
                            draftTags={this.state.draftTags}
                            handleTaskCreated={this.handleTaskCreated}
                            handleDraftTagCreated={this.handleDraftTagCreated}
                        />

                        <div>
                            <button onClick={() => (this.setState({currentTasksView: !this.state.currentTasksView}))}>Switch View</button>

                            {this.state.currentTasksView ? (
                                <TaskList
                                    {...this.props}
                                    tasks={this.state.tasks.filter((task) => (!task.completed))}
                                    fullTasks={this.state.tasks}
                                    filterTags={this.state.filterTags}
                                    tags={this.state.tags}
                                    error={this.state.error}
                                    draggable={true}
                                    handleTaskMoved={this.handleTaskMoved}
                                    handleTaskCompleted={this.handleTaskCompleted}
                                    handleDeleteTask={this.handleDeleteTask}
                                    handleUpdateTask={this.handleUpdateTask}
                                />
                            ) : (
                                <CompletedTaskList
                                    {...this.props}
                                    tasks={
                                        this.state.tasks
                                            .filter((task) => (task.completed))
                                            .sort((a, b) => (new Date(b.completed_at) - new Date(a.completed_at)))
                                    }
                                    filterTags={this.state.filterTags}
                                    handleDeleteTask={this.handleDeleteTask}
                                />
                            )}
                        </div>

                        <div>
                            <br/><br/><br/>
                            <TagList
                                {...this.props}
                                tags={this.state.tags}
                                handleTagCreated={this.handleTagCreated}
                                handleFilterTagsChanged={this.handleFilterTagsChanged}
                            />
                        </div>
                    </AppContainer>

                    {this.state.undoType !== null &&
                        <UndoPrompt>
                            <UndoPromptText>
                                {this.state.undoType === 'completed' &&
                                'Task marked as completed.'
                                }
                                {this.state.undoType === 'deleted' &&
                                'Task deleted.'
                                }
                            </UndoPromptText>
                            <UndoPromptButton
                                onClick={this.state.undoType === 'completed' ? this.handleUndoComplete : this.handleUndoDelete}
                            >
                                Undo
                            </UndoPromptButton>
                            <FontAwesomeIcon icon={faTimes} onClick={this.handleRejectUndo} />
                        </UndoPrompt>
                    }
                </OuterContainer>
            </React.Fragment>
        );
    }
}

export default requireAuth(App);