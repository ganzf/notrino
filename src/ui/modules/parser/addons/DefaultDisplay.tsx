import { faCircle, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { parseTwoDigitYear } from 'moment';
import React from 'react';
import { Addon, AParsed, ParsingContext } from '../types';

export class DefaultDisplay implements Addon {
  execute(parsed: AParsed, context: ParsingContext) {
    const line = context.currentLine;
    if (line.isEmpty()) {
      line.printable = true;
      line.display = () => {
        return <p className='empty-line'></p>
      };
      return;
    }

    if (!line.useDefaultDisplay) {
      return;
    }

    line.display = () => {
      if (!line.printable) {
        return null;
      }
      const before = line.before.map((namedFunction) => namedFunction.exec());
      const classes = line.classes;
      let text: any = line.content || line.text!;

      return <p className={classNames(classes)}>
        {before}
        {text}
      </p>
    }
  }
}
