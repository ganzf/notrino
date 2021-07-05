import React from 'react';

interface Props {
    id: string;
    value: string | null;
    notifyChange: Function;
    onEnter: Function;
}

export default class ResizableTextarea extends React.PureComponent<Props, any> {
    constructor(props: Props) {
        super(props);
        this.state = {
            value: '',
            rows: 1,
            minRows: 1,
            maxRows: 3,
        };
    }

    handleChange = (event: any) => {
        const textareaLineHeight = 24;
        const { minRows, maxRows } = this.state;

        const previousRows = event.target.rows;
        event.target.rows = minRows; // reset number of rows in textarea 

        const currentRows = ~~(event.target.scrollHeight / textareaLineHeight);

        if (currentRows === previousRows) {
            event.target.rows = currentRows;
        }

        if (currentRows >= maxRows) {
            event.target.rows = maxRows;
            event.target.scrollTop = event.target.scrollHeight;
        }

        this.setState({
            value: event.target.value,
            rows: currentRows < maxRows ? currentRows : maxRows,
        });
        this.props.notifyChange(event.target.value);
    };

    render() {
        return (
            <textarea
                id={this.props.id}
                rows={this.state.rows}
                value={this.props.value || ''}
                className={'resizeable-textarea'}
                onChange={this.handleChange}
                onKeyPress={(e) => { 
                    if (e.key === 'Enter') {
                        this.props.onEnter();
                    }
                }}
            />
        );
    }
}
