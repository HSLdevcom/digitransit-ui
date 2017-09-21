import PropTypes from 'prop-types';
import React from 'react';

import { FormattedMessage, intlShape } from 'react-intl';
import Icon from './Icon';

const secondaryButton = (props, context) =>
  <button
    className="secondary-button"
    aria-label={context.intl.formatMessage({
      id: props.buttonParams.ariaLabel,
      defaultMessage: props.buttonParams.ariaLabel,
    })}
    onClick={e => props.buttonParams.buttonClickAction(e)}
  >
    {props.buttonParams.buttonIcon &&
      <Icon img={props.buttonParams.buttonIcon} />}
    <FormattedMessage
      id={props.buttonParams.buttonName}
      defaultMessage={props.buttonParams.buttonName}
    />
  </button>;

secondaryButton.propTypes = {
  buttonParams: PropTypes.shape({
    ariaLabel: PropTypes.string.isRequired,
    buttonName: PropTypes.string.isRequired,
    buttonClickAction: PropTypes.function,
    buttonIcon: PropTypes.string,
  }),
};

secondaryButton.contextTypes = {
  intl: intlShape.isRequired,
};

export default secondaryButton;
