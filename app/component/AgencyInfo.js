import PropTypes from 'prop-types';
import React from 'react';

import ExternalLink from './ExternalLink';

function AgencyInfo({ agencyName, url }) {
  if (agencyName && url) {
    const link = url.indexOf('://') === -1 ? `//${url}` : url;

    return (
      <div className="agency-link-container">
        <ExternalLink className="agency-link" href={link}>
          {agencyName}
        </ExternalLink>
      </div>
    );
  }
  return null;
}

AgencyInfo.propTypes = {
  agencyName: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

export default AgencyInfo;
