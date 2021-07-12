import React from 'react';
import { Provider } from 'react-redux';
import Home from '../pages/Home';
import core from '../index';
import QuickThoughtEditor from './QuickThoughtEditor';

interface Props { };
interface State { };

class Root extends React.Component<Props, State> {
    render() {
        const store = core.store!!;
        return (
            <>
                <Provider store={store.getProvider()}>
                    <Home />
                    <QuickThoughtEditor />
                </Provider>
            </>
        )
    }
}

export default Root;
