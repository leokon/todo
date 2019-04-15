const tasks = 1;
const completed = 2;
const statistics = 3;

/**
 * Class containing constants representing the possible application view states.
 */
class Views {
    static get tasks() {
        return tasks;
    }

    static get completed() {
        return completed;
    }

    static get statistics() {
        return statistics;
    }
}

export default Views;