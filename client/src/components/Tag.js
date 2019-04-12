import React from 'react';
import styled from 'styled-components';

const Container = styled.span`
    width: fit-content;
    max-width: 110px;
    padding: 4px;
    border-radius: 4px;
    background-color: #1595ad;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

class Tag extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Container onClick={this.props.onClick} title={this.props.tag.name}>
                {this.props.tag.name}
            </Container>
        );
    }
}

export default Tag;