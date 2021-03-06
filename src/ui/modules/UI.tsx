import React from 'react';
import ReactDOM from 'react-dom';

import IUI from '../include/IUI';
import Root from '../components/Root';
import IUICore from '../include/IUICore';
import ExceptionBoundary from '../components/ExceptionBoundary';

class ReactUI implements IUI {
    render() {
        ReactDOM.render(
            /*
                StrictMode is a tool for highlighting potential problems in an application.
                Like Fragment, StrictMode does not render any visible UI.
                It activates additional checks and warnings for its descendants.

                https://reactjs.org/docs/strict-mode.html
            */
            <React.StrictMode>
                <ExceptionBoundary>
                    <Root />
                </ExceptionBoundary>
            </React.StrictMode>,
            document.getElementById('root')
          );
    }
}

export default ReactUI;
