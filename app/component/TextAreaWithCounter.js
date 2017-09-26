import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import ComponentUsageExample from './ComponentUsageExample';

const TextAreaWithCounter = props => {
  let counter;

  if (props.showCounter) {
    counter = (
      <p className={props.counterClassName}>
        <b>{`${props.charLeft} `}</b>
        <FormattedMessage id="char-left" defaultMessage="characters" />
      </p>
    );
  }

  return (
    <span>
      {counter}
      <textarea
        maxLength={props.showCounter ? props.maxLength : false}
        className={props.areaClassName}
        rows={props.rows}
        onChange={props.handleChange}
      />
    </span>
  );
};

TextAreaWithCounter.propTypes = {
  showCounter: PropTypes.bool,
  counterClassName: PropTypes.string,
  maxLength: PropTypes.number,
  areaClassName: PropTypes.string,
  rows: PropTypes.number,
  charLeft: PropTypes.number,
  handleChange: PropTypes.func.isRequired,
};

TextAreaWithCounter.defaultProps = {
  areaClassName: '',
  counterClassName: '',
  rows: 4,
};

TextAreaWithCounter.displayName = 'TextAreaWithCounter';

TextAreaWithCounter.description = () => (
  <div>
    <p>Renders a text area. Counter is optional</p>
    <ComponentUsageExample description="">
      <TextAreaWithCounter
        showCounter
        maxLength={200}
        handleChange={() => {}}
        charLeft={200}
      />
    </ComponentUsageExample>
  </div>
);

TextAreaWithCounter.PropTypes = {
  showCounter: PropTypes.bool,
  maxLength: PropTypes.number,
  charLeft: PropTypes.number,
  handleChange: PropTypes.func,
  counterClassName: PropTypes.string,
  areaClassName: PropTypes.string,
};

export default TextAreaWithCounter;
