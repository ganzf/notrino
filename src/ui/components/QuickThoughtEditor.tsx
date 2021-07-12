import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { connect } from 'react-redux';
import { ResizableTextarea } from 'design-system';
import core from 'ui';

interface Props {
    quickThought: string | null;
    show: boolean;

    thoughtHistory?: string[];
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
                        core.store.set('thoughtHistory', (history: any = []) => {
                            return [...history, this.props.quickThought]
                        })
                        core.store.remove('quickThought');
                    }}
                />
                <div style={{ marginTop: '8px', width: '50%' }}>
                    {
                        this.props.thoughtHistory?.reverse().map((thought: string, index) => {
                            if (index > 6) {
                                return null;
                            }
                            return <div style={{ opacity: `${1 - index / 5}` }}>{thought}</div>
                        })
                    }
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state: any) => ({
    show: state.global.showQuickThoughtEditor,
    quickThought: state.global.quickThought,
    thoughtHistory: state.global.thoughtHistory,
});

export default connect(mapStateToProps)(QuickThoughtEditor);