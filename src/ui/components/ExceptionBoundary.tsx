import React from 'react';

interface Props {};

class ExceptionBoundary extends React.Component<Props, any> {
  constructor(props: Props) {
    super(props);
    this.state = {
      error: undefined,
    }
  }

  componentDidCatch(error: any, info: any) {
    // Display fallback UI
    this.setState({ error });
  }

  render() {
    if (this.state.error) {
      return <div>
        An unknown error occured.
      </div>
    }
    return this.props.children;
  }
}

export default ExceptionBoundary;
