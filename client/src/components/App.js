import React from 'react';
import styled from 'styled-components';
import _ from 'underscore';

import Helpers from '../helpers.js';
import Auth from '../auth.js';
import requireAuth from './RequireAuth.js';
import TaskList from './TaskList.js';
import TaskForm from './TaskForm.js';
import TagList from './TagList.js';

const OuterContainer = styled.div`
    display: flex;
    justify-content: center;
`;

const NavbarContainer = styled.div`
    height: 45px;
    background-color: #1595AD;
`;

const AppContainer = styled.div`
    width: 50%;
    background-color: #FFFFFF;
    border: 1px solid #CDCDCD;
    padding-left: 25px;
    padding-right: 25px;
    margin-top: 20px;
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
        this.setState({tasks: [...this.state.tasks, task]});

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
            tasks: tasksCopy
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
    handleDeleteTask(task) {
        let removeIndex = this.state.tasks.findIndex((t) => (task.id === t.id));

        let newTasks = this.state.tasks.concat();
        newTasks.splice(removeIndex, 1);

        this.setState({
            tasks: newTasks
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

    handleLogout() {
        this.Auth.logout();
        this.props.history.replace('/login');
    }

    render() {
        return (
            <React.Fragment>
                <NavbarContainer>
                    <button onClick={this.handleLogout}>Logout</button>
                </NavbarContainer>

                <OuterContainer>
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
                                <TaskList
                                    {...this.props}
                                    tasks={
                                        this.state.tasks
                                            .filter((task) => (task.completed))
                                            .sort((a, b) => (new Date(b.completed_at) - new Date(a.completed_at)))
                                    }
                                    filterTags={this.state.filterTags}
                                    tags={this.state.tags}
                                    error={this.state.error}
                                    draggable={false}
                                    handleDeleteTask={this.handleDeleteTask}
                                    handleUpdateTask={this.handleUpdateTask}
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
                </OuterContainer>
            </React.Fragment>
        );
    }
}

export default requireAuth(App);