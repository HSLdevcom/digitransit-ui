import PropTypes from 'prop-types';
import React from 'react';

import { FormattedMessage, intlShape } from 'react-intl';
import Icon from './Icon';

const secondaryButton = (props, context) =>
  <button
    className={`secondary-button ${props.buttonName} ${props.smallSize &&
      `small`}`}
    aria-label={context.intl.formatMessage({
      id: props.ariaLabel,
      defaultMessage: props.ariaLabel,
    })}
    onClick={e => props.buttonClickAction(e)}
  >
    {props.buttonIcon && <Icon img={props.buttonIcon} />}
    <FormattedMessage id={props.buttonName} defaultMessage={props.buttonName} />
  </button>;

secondaryButton.propTypes = {
  ariaLabel: PropTypes.string.isRequired,
  buttonName: PropTypes.string.isRequired,
  buttonClickAction: PropTypes.function,
  buttonIcon: PropTypes.string,
  smallSize: PropTypes.bool,
};

secondaryButton.contextTypes = {
  intl: intlShape.isRequired,
};

export default secondaryButton;
