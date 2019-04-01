import React from 'react';

class Tag extends React.Component {
    getStyles() {
        return {
            color: this.props.selected ? 'green' : 'black',
            border: '1px solid black',
            padding: '2px'
        };
    }

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div onClick={this.props.onClick} style={this.getStyles()} >
                {this.props.tag.name}
            </div>
        );
    }
}

export default Tag;