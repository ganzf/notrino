import React from 'react';
import ContentEditable from 'react-contenteditable';

interface Props { 
  onEnter: Function;
};

interface State {
  html: string;
}

class Line extends React.Component<Props, State> {
  contentEditable: any;
  constructor(props: Props) {
    super(props);  
    this.state = { html: '\u00A0' };
    this.contentEditable = React.createRef();
  }

  handleChange = (e: any) => { 
    // console.log({ e });
  }

  render() {
    return (
      <div className='line-container'>
        <ContentEditable
          className='editable'
          onChange={(e: any) => { 
            this.handleChange(e);
          }}
          innerRef={this.contentEditable}
          tagName='div'
          html={this.state.html}
          onKeyDown={(e: any) => { 
            const isEnter = e.nativeEvent?.key === 'Enter';
            console.log({ e });
            if (isEnter) {
              this.props.onEnter();
              e.stopPropagation();
              e.preventDefault();
              console.log('ENTER');
            }
          }}
        />
      </div>
    )
  }
}

export default Line;