import React from 'react';
import Relay from 'react-relay';
import get from 'lodash/get';
import { intlShape } from 'react-intl';

import ExternalLink from './ExternalLink';

function LegAgencyInfo({ leg }, { config }) {
  const agencyName = get(leg, 'agency.name');
  const url = get(leg, 'agency.fareUrl') || get(leg, 'agency.url');
  const show = get(config, 'agency.show', false);
  if (show && agencyName && url) {
    return (<div className="itinerary-leg-agency">
      <div className="agency-link-container">
        <ExternalLink
          className="itinerary-leg-agency-link"
          href={url}
        ><div className="overflow-fade">{agencyName}</div></ExternalLink>
      </div>
    </div>);
  }
  return null;
}

LegAgencyInfo.contextTypes = {
  intl: intlShape.isRequired,
  config: React.PropTypes.object.isRequired,
};

LegAgencyInfo.propTypes = {
  leg: React.PropTypes.object,
};

export default Relay.createContainer(LegAgencyInfo, {
  fragments: {
    leg: () =>
      Relay.QL`
      fragment on Leg {
        agency {
          name
          url
          fareUrl
        }
      }
    `,
  },
});
