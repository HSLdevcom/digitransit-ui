import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import { FormattedMessage, useIntl } from 'react-intl';
import Icon from './Icon';

const secondaryButton = props => {
  const intl = useIntl();
  const className = cx([
    'secondary-button',
    props.buttonName,
    { small: props.smallSize },
  ]);
  return (
    <button
      type="button"
      className={className}
      aria-label={intl.formatMessage({
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

export default secondaryButton;
