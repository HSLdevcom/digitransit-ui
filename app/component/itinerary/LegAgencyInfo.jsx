import React from 'react';
import { useFragment } from 'react-relay';
import get from 'lodash/get';
import { legShape, configShape } from '../../util/shapes.js';
import AgencyInfo from '../AgencyInfo.jsx';
import { LegAgencyInfoFragment } from './queries/LegAgencyInfoFragment.js';

function LegAgencyInfo({ leg: legRef }, { config }) {
  const leg = useFragment(LegAgencyInfoFragment, legRef);
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
  config: configShape.isRequired,
};

LegAgencyInfo.propTypes = { leg: legShape.isRequired };

export default LegAgencyInfo;
