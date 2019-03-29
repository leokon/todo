import React from 'react';
import Helpers from '../helpers.js';
import Auth from '../auth.js';
import requireAuth from './RequireAuth.js';
import TaskList from './TaskList.js';
import TaskForm from './TaskForm.js';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tasks: [],
            tags: [],
            error: null
        };

        this.handleLogout = this.handleLogout.bind(this);
        this.handleTaskCreated = this.handleTaskCreated.bind(this);
        this.handleTaskMoved = this.handleTaskMoved.bind(this);
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
            this.setState({tags: tags});
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
     * Updates task array state in response to a new task being created.
     */
    async handleTaskCreated(task) {
        let tasksArray = Array.from(this.state.tasks);
        tasksArray.push(task);
        tasksArray.sort((a, b) => (a.position > b.position ? 1 : -1));
        this.setState({tasks: tasksArray});
    }

    /**
     * Updates task state in response to task position being changed.
     */
    async handleTaskMoved(fromIndex, toIndex) {
        // update tasks array so that the task at fromIndex is now at toIndex, shuffling the other tasks respectively
        let tasks = Array.from(this.state.tasks);
        let [movingTask] = tasks.splice(fromIndex, 1);
        tasks.splice(toIndex, 0, movingTask);

        this.setState({tasks: tasks});
    }

    handleLogout() {
        this.Auth.logout();
        this.props.history.replace('/login');
    }

    render() {
        return (
            <div>
                <div>Base app entry point component</div>
                <button onClick={this.handleLogout}>Logout</button>

                <TaskForm handleTaskCreated={this.handleTaskCreated} />
                <TaskList {...this.props} tasks={this.state.tasks} error={this.state.error} handleTaskMoved={this.handleTaskMoved} />
            </div>
        );
    }
}

export default requireAuth(App);