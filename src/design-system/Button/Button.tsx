import React from 'react';
import { Button as Btn } from 'react-bootstrap';

interface Props {
    text: string;
    onClick(): void;
}

class Button extends React.Component<Props> {
    render() {
        const { text, onClick } = this.props;
        return (
            <Btn onClick={onClick} variant={'primary'} size={'sm'}>
                {text}
            </Btn>
        )
    }
}

export default Button;