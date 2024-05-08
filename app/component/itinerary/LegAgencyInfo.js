import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import get from 'lodash/get';
import { intlShape } from 'react-intl';
import { legShape, configShape } from '../../util/shapes';
import AgencyInfo from '../AgencyInfo';

function LegAgencyInfo({ leg }, { config }) {
  const agencyName = get(leg, 'agency.name');
  const url = get(leg, 'agency.fareUrl') || get(leg, 'agency.url');
  const show = get(config, 'agency.show', false);
  if (show) {
    return (
      <div className="itinerary-leg-agency">
        <AgencyInfo url={url} agencyName={agencyName} />
      </div>
    );
  }
  return null;
}

LegAgencyInfo.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
};

LegAgencyInfo.propTypes = { leg: legShape.isRequired };

export default createFragmentContainer(LegAgencyInfo, {
  leg: graphql`
    fragment LegAgencyInfo_leg on Leg {
      agency {
        name
        url
        fareUrl
      }
    }
  `,
});
