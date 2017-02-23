import React from 'react';
import Relay from 'react-relay';
import get from 'lodash/get';
import { intlShape } from 'react-intl';
import AgencyInfo from './AgencyInfo';

function LegAgencyInfo({ leg }, { config }) {
  const agencyName = get(leg, 'agency.name');
  const url = get(leg, 'agency.fareUrl') || get(leg, 'agency.url');
  const show = get(config, 'agency.show', false);
  if (show) {
    return (<div className="itinerary-leg-agency">
      <AgencyInfo url={url} agencyName={agencyName} />
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
