import React from 'react';
import { Button as Btn } from 'react-bootstrap';

interface Props {
    text: string;
    onClick(): void;
    disabled?: boolean;
}

class Button extends React.Component<Props> {
    render() {
        const { text, onClick, disabled } = this.props;
        return (
            <Btn onClick={onClick} variant={'primary'} size={'sm'} disabled={disabled} >
                {text}
            </Btn>
        )
    }
}

export default Button;