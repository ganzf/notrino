import React from 'react';

class NoteString extends React.Component<any> {
  render() {
    const { definition } = this.props;
    const args = this.props.args;
    const style: any = {};
    if (args) {
      const sizeReg = /[0-9]+px/;
      const match = sizeReg.exec(args);
      if (match) {
        style.fontSize = match[0];
      }
    }
    return <span className='notestring' style={style}>{definition.value}</span>
  }
};

export default NoteString;