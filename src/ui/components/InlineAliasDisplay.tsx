import React from 'react';
import { connect } from 'react-redux';
import { isWhiteSpaceLike } from 'typescript';
import reducer from 'ui/modules/redux/notes/reducer';
import ReactDOMServer from 'react-dom/server';

const containerStyle: any = {
  position: 'relative',
  padding: '4px',
  background: 'white',
  borderRadius: '4px',
  margin: '2px',
  color: 'black',
}

const variableNameStyle: any = {
  position: 'absolute',
  top: `-10px`,
  transform: 'translateX(50%)',
  right: 0,
  fontSize: '8px',
  color: 'black',
  background: 'dodgerblue',
  padding: '2px',
  lineHeight: 'normal',
  borderRadius: '4px',

}

class InlineAliasDisplay extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      selected: false,
    }
  }
  
  render() {
    const { name, value } = this.props.alias;
    const { locals } = this.props;
    let display = value;
    if (locals[name]) {
      display = locals[name];
    }
    if (this.state.selected) {
      display = name;
    }
    console.log({ display });

    return (
      <div
        tabIndex={1}
        style={containerStyle}
        
        onFocus={() => {
          this.setState({ selected: true });
          console.log('Focus ' + name);
        }}
        onBlur={() => {
          this.setState({ selected: false });
          console.log('Blur ' + name);
        }}>
        {display}
        {/* <div contentEditable={false} style={variableNameStyle}>
          {name}
        </div> */}
      </div>
    )
  }
}

const mapStateToProps = (state: any) => ({
  locals: state.global.locals,
});

export default connect(mapStateToProps)(InlineAliasDisplay);