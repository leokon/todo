import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 250px;
`;

class Statistics extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Container>
                Stats aren't ready yet, check again soon! 🙂
            </Container>
        );
    }
}

export default Statistics;