import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Badge from './Badge';
import Icon from './Icon';
import ExternalLink from './ExternalLink';
import { AlertSeverityLevelType } from '../constants';

const DisruptionDetails = ({
  alertDescriptionText,
  alertHeaderText,
  alertEffect,
  alertSeverityLevel,
  alertUrl,
}) => {
  const checkedUrl =
    alertUrl &&
    (alertUrl.match(/^[a-zA-Z]+:\/\//) ? alertUrl : `http://${alertUrl}`);

  return (
    <div className="alert-details">
      <div className="alert-details-header">
        <span className="badge-container">
          <Badge
            showIcon
            variant={alertSeverityLevel || AlertSeverityLevelType.Unknown}
            label={alertEffect || 'no_service'}
          />
        </span>
        <span className="validity">
          <Icon className="clock-icon" img="icon_clock" />
          <FormattedMessage id="valid" />
        </span>
      </div>
      <div className="alert-details-content">
        {alertHeaderText && <h2>{alertHeaderText}</h2>}
        <p>{alertDescriptionText}</p>
        {checkedUrl && (
          <ExternalLink className="alert-url" href={checkedUrl}>
            <FormattedMessage id="extra-info" />
          </ExternalLink>
        )}
      </div>
    </div>
  );
};

DisruptionDetails.propTypes = {
  alertDescriptionText: PropTypes.string.isRequired,
  alertHeaderText: PropTypes.string,
  alertEffect: PropTypes.string,
  alertSeverityLevel: PropTypes.string,
  alertUrl: PropTypes.string,
};

export default DisruptionDetails;
