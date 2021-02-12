import React from 'react';
import { connect } from 'react-redux';
import '../css/editorv1.css';
import Line from './Line';

interface Props { };

const mapStateToProps = (state: any) => ({

})

class EditorV1 extends React.Component<Props, any> {
  constructor(props: Props) {
    super(props);
    this.state = {
      lines: [
        { hihi: 'lol' }
      ],
    };
  }

  render() {
    return (
      <div className='editor'>
        { this.state.lines.map((line: any) => {
          return <Line
            onEnter={() => {
              this.setState((prev: any) => ({
                ...prev,
                lines: [...prev.lines, { blablou: 'lol' }],
              }))
            }}
          />
        })}
      </div>
    )
  }
}

export default connect(mapStateToProps)(EditorV1);
