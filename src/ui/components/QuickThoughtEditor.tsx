import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { connect } from 'react-redux';
import { ResizableTextarea } from 'design-system';
import core from 'ui';

interface Props {
    quickThought: string | null;
    show: boolean;
};

class QuickThoughtEditor extends React.PureComponent<Props> {
    render() {
        if (!this.props.show) {
            return null;
        }
        return (
            <div className="quick-thought-editor-container">
                <div className="quick-thought-editor-label">
                    <label>What's on your mind ?</label>
                    <FontAwesomeIcon icon={faTimes} onClick={() => {
                        core.store.set('showQuickThoughtEditor', false);
                    }} />
                </div>
                <ResizableTextarea
                    id="quick-thought-editor-input"
                    value={this.props.quickThought || ''}
                    notifyChange={(value: string) => {
                        core.store.set('quickThought', value);
                    }}
                    onEnter={() => { 
                        core.store.set('showQuickThoughtEditor', false);
                        core.store.remove('quickThought');
                    }}
                />
            </div>
        )
    }
}

const mapStateToProps = (state: any) => ({
    show: state.global.showQuickThoughtEditor,
    quickThought: state.global.quickThought,
});

export default connect(mapStateToProps)(QuickThoughtEditor);