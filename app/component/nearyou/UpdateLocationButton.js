import { FormattedMessage, intlShape } from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';

export default function UpdateLocationButton({ mode, onClick }, { intl }) {
  return (
    <div className="nearest-stops-update-container">
      <FormattedMessage id="nearest-stops-updated-location" />
      <button type="button" className="update-stops-button" onClick={onClick}>
        <Icon img="icon_update" />
        <FormattedMessage
          id="nearest-stops-update-location"
          defaultMessage="Update stops"
          values={{
            mode: intl.formatMessage({
              id: `nearest-stops-${mode.toLowerCase()}`,
            }),
          }}
        />
      </button>
    </div>
  );
}

UpdateLocationButton.propTypes = {
  mode: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

UpdateLocationButton.contextTypes = {
  intl: intlShape.isRequired,
};
