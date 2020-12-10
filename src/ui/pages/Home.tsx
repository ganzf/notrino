import React from 'react';
import { Button } from '../../design-system';

// TODO: Replace parent with Page ?
class Home extends React.Component {
    render() {
        return <>
            <Button text={"Hello World"} onClick={() => { console.log('yiss'); }}/>
        </>;
    }
}

export default Home;