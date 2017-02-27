import React from 'react';

import ExternalLink from './ExternalLink';

function AgencyInfo({ agencyName, url }) {
  if (agencyName && url) {
    return (
      <div className="agency-link-container">
        <ExternalLink
          className="agency-link"
          href={url}
        ><div className={agencyName.length > 30 ? 'overflow-fade' : ''}>{agencyName}</div></ExternalLink>
      </div>);
  }
  return null;
}

AgencyInfo.propTypes = {
  agencyName: React.PropTypes.string.isRequired,
  url: React.PropTypes.string.isRequired,
};

export default AgencyInfo;
