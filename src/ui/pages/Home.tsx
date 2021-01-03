import React from 'react';
import { connect } from 'react-redux';
import BasicEditor from 'ui/components/BasicEditor';
import { Button } from '../../design-system';
import core from '../index';

// TODO: Replace parent with Page ?
class Home extends React.Component<any> {
    render() {
        return <div className='page'>
            <BasicEditor />
        </div>;
    }
}

const mapState = (state: any) => ({
    notes: state.global.notes,
})

export default connect(mapState)(Home);