import React from 'react';
import styled from 'styled-components';

const Container = styled.span`
    width: fit-content;
    max-width: 110px;
    padding: 2px;
    border-radius: 4px;
    background-color: #1595ad;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
    border: ${props => props.selected ? '2px solid black' : '2px solid transparent'};
`;

class Tag extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Container onClick={this.props.onClick} title={this.props.tag.name} selected={this.props.selected}>
                {this.props.tag.name}
            </Container>
        );
    }
}

export default Tag;