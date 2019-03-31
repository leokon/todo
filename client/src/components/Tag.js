import React from 'react';

class Tag extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                {this.props.tag.name}
            </div>
        );
    }
}

export default Tag;