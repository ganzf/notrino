import React from 'react';
import { faCheck, faCheckDouble, faCross, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class TaskReference extends React.Component<any> {
  render() {
    const { note, definition } = this.props;
    const data = note.state.Tasks && note.state.Tasks[definition.ref];
    let icon = faTimes;
    let color = 'crimson';
    if (data && data.isDone) {
      icon = faCheck;
      color = 'gold';
    }
    return <span className='TaskReference'>
      <FontAwesomeIcon icon={icon} color={color} style={{ width: '12px' }} /> {definition.value}
    </span>
  }
}

export default TaskReference;