import React from 'react';
import { FormattedMessage } from 'react-intl';

import ComponentUsageExample from './ComponentUsageExample';

const TextAreaWithCounter = (props) => {
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
  showCounter: React.PropTypes.bool,
  counterClassName: React.PropTypes.string,
  maxLength: React.PropTypes.number,
  areaClassName: React.PropTypes.string,
  rows: React.PropTypes.number,
  charLeft: React.PropTypes.number,
  handleChange: React.PropTypes.func.isRequired,
};

TextAreaWithCounter.defaultProps = {
  areaClassName: '',
  counterClassName: '',
  rows: 4,
};

TextAreaWithCounter.displayName = 'TextAreaWithCounter';

TextAreaWithCounter.description = () =>
  <div>
    <p>Renders a text area. Counter is optional</p>
    <ComponentUsageExample description="">
      <TextAreaWithCounter showCounter maxLength={200} handleChange={() => {}} charLeft={200} />
    </ComponentUsageExample>
  </div>;

TextAreaWithCounter.PropTypes = {
  showCounter: React.PropTypes.bool,
  maxLength: React.PropTypes.number,
  charLeft: React.PropTypes.number,
  handleChange: React.PropTypes.func,
  counterClassName: React.PropTypes.string,
  areaClassName: React.PropTypes.string,
};

export default TextAreaWithCounter;
