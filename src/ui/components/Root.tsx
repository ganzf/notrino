import React from 'react';
import Home from '../pages/Home';

interface Props { };
interface State { };

class Root extends React.Component<Props, State> {
    render() {
        return (
            <div>
                <Home />
            </div>
        )
    }
}

export default Root;