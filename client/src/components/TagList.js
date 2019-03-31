import React from 'react';
import Helpers from '../helpers.js';
import Tag from './Tag.js';


/**
 * Represents a list of tags associated with the currently authenticated user, including elements for creation and deletion of tags.
 */
class TagList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            error: null
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    /**
     * Handles new tag creation, takes data from form and makes server request, uses callback to update state
     */
    async handleSubmit(event) {
        event.preventDefault();

        try {
            let createdTag = await Helpers.fetch('/api/tags', {
                method: 'POST',
                body: JSON.stringify({
                    name: this.state.name
                })
            });

            if (createdTag) {
                this.props.handleTagCreated(createdTag);
                this.setState({name: ''});
            } else {
                this.setState({error: true});
            }
        } catch (error) {
            this.setState({error: error});
        }
    }

    render() {
        return (
            <div>
                <div>
                    <form onSubmit={this.handleSubmit} >
                        <input type="text" name="name" value={this.state.tagName} onChange={this.handleChange} />
                        <input type="submit" value="Submit" />
                    </form>

                    {this.state.error &&
                        <div>Error: could not create tag.</div>
                    }
                </div>

                <div>
                    {this.props.tags.map((tag, index) => {
                        return (
                            <Tag key={tag.id} tag={tag} />
                        );
                    })}
                </div>
            </div>
        );
    }
}

export default TagList;