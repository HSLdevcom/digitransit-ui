import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import { FormattedMessage, intlShape } from 'react-intl';
import Icon from './Icon';

const secondaryButton = (props, context) => {
  const className = cx([
    'secondary-button',
    props.buttonName,
    { small: props.smallSize },
  ]);
  return (
    <button
      className={className}
      aria-label={context.intl.formatMessage({
        id: props.ariaLabel,
        defaultMessage: props.ariaLabel,
      })}
      onClick={e => props.buttonClickAction(e)}
    >
      {props.buttonIcon && <Icon img={props.buttonIcon} />}
      <FormattedMessage
        id={props.buttonName}
        defaultMessage={props.buttonName}
      />
    </button>
  );
};

secondaryButton.propTypes = {
  ariaLabel: PropTypes.string.isRequired,
  buttonName: PropTypes.string.isRequired,
  buttonClickAction: PropTypes.func.isRequired,
  buttonIcon: PropTypes.string,
  smallSize: PropTypes.bool,
};

secondaryButton.contextTypes = {
  intl: intlShape.isRequired,
};

export default secondaryButton;
