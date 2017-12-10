import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

export default function DisruptionInfoButton(props, { config }) {
  if (!config.disruption || config.disruption.showInfoButton) {
    return (
      <button
        className="cursor-pointer disruption-info noborder"
        onClick={props.toggleDisruptionInfo}
      >
        <FormattedMessage id="disruptions" defaultMessage="Disruptions" />
        {props.hasAlerts && (
          <Icon img="icon-icon_caution" className="disruption-info" />
        )}
      </button>
    );
  }
  return null;
}

DisruptionInfoButton.propTypes = {
  toggleDisruptionInfo: PropTypes.func.isRequired,
  hasAlerts: PropTypes.bool.isRequired,
};

DisruptionInfoButton.contextTypes = {
  config: PropTypes.object.isRequired,
};
