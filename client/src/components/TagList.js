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
            error: null,
            selectedIndexes: [],
            selectedTags: []
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleClickTag = this.handleClickTag.bind(this);
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

    /**
     * Handles a tag in the tag list being clicked on, selects or deselects it based on state and propagates changes to parent
     */
    handleClickTag(tag, index) {
        if (this.state.selectedIndexes.includes(index)) {
            // tag is already selected, mark it as deselected and remove it from filter tags
            this.setState({
                selectedIndexes: this.state.selectedIndexes.filter((i) => (i !== index)),
                selectedTags: this.state.selectedTags.filter((t) => (t.id !== tag.id))
            }, () => {this.props.handleFilterTagsChanged(this.state.selectedTags)});
        } else {
            // tag is not already selected, mark it as selected and add it to filter tags
            this.setState({
                selectedIndexes: [...this.state.selectedIndexes, index],
                selectedTags: [...this.state.selectedTags, tag]
            }, () => {this.props.handleFilterTagsChanged(this.state.selectedTags)});
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
                    {this.props.tags.map((tag, index) => (
                        <Tag
                            key={tag.id}
                            tag={tag}
                            selected={this.state.selectedIndexes.includes(index)}
                            onClick={() => this.handleClickTag(tag, index)}
                        />
                    ))}
                </div>
            </div>
        );
    }
}

export default TagList;

// TODO:
    // tag controls, delete tags, edit tags, etc, inline controls in list, in Tag component