import React from 'react';
import { useFragment } from 'react-relay';
import get from 'lodash/get';
import { legShape } from '../../../utils/client/shapes';
import AgencyInfo from '../AgencyInfo';
import { LegAgencyInfoFragment } from './queries/LegAgencyInfoFragment';
import { useConfigContext } from '../../client/ConfigContext';

function LegAgencyInfo({ leg: legRef }) {
  const config = useConfigContext();
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

LegAgencyInfo.propTypes = { leg: legShape.isRequired };

export default LegAgencyInfo;
