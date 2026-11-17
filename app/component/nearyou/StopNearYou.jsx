import { useState } from 'react';
import PropTypes from 'prop-types';
import { useRefetchableFragment } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'found';
import { fragmentRefShape } from '../../../utils/client/shapes';
import {
  hasEntitiesOfType,
  isAlertValid,
} from '../../../utils/client/alertUtils';
import { stopPagePath } from '../../../utils/shared/path';
import { AlertEntityType } from '../../../utils/shared/constants';
import NearYouHeader from './NearYouHeader';
import AlertBanner from '../AlertBanner';
import StopNearYouDepartureRowContainer from './StopNearYouDepartureRowContainer';
import CapacityModal from '../CapacityModal';
import { useConfigContext } from '../../hooks/ConfigContext';
import { useCurrentTime } from '../../hooks/TimeContext';
import useRefetchOnTick from '../../hooks/useRefetchOnTick';
import StopNearYouFragment from './queries/StopNearYouFragment';
import RefetchQuery from './queries/__generated__/StopNearYouFragmentRefetchQuery.graphql';

export default function StopNearYou({ stop: stopRef, isParentTabActive }) {
  const config = useConfigContext();
  const currentTime = useCurrentTime();
  const intl = useIntl();
  const [capacityModalOpen, setCapacityModalOpen] = useState(false);
  const [stop, refetch] = useRefetchableFragment(StopNearYouFragment, stopRef);
  const { gtfsId, vehicleMode } = stop;

  useRefetchOnTick(
    refetch,
    StopNearYouFragment,
    stopRef,
    RefetchQuery,
    isParentTabActive,
  );
  if (!stop.stoptimesWithoutPatterns) {
    return null;
  }

  const isStation = stop.locationType === 'STATION';
  const linkAddress = stopPagePath(isStation, gtfsId);
  const { constantOperationStops } = config;
  const { locale } = intl;
  const isConstantOperation = constantOperationStops[gtfsId];
  const filteredAlerts = stop.alerts.filter(
    alert =>
      hasEntitiesOfType(alert, AlertEntityType.Stop) &&
      isAlertValid(alert, currentTime),
  );

  return (
    <span role="listitem">
      <div className="stop-near-you-container">
        <NearYouHeader
          stop={stop}
          desc={stop.desc}
          isStation={isStation}
          linkAddress={linkAddress}
          mode={vehicleMode}
        />
        <span className="sr-only">
          <FormattedMessage
            id="departure-list-update.sr-instructions"
            default="The departure list and estimated departure times will update in real time."
          />
        </span>
        {filteredAlerts.length > 0 && (
          <AlertBanner alerts={filteredAlerts} linkAddress={linkAddress} />
        )}
        {isConstantOperation ? (
          <div className="stop-constant-operation-container bottom-margin">
            <div style={{ width: '85%' }}>
              <span>{constantOperationStops[gtfsId][locale].text}</span>
              <span style={{ display: 'inline-block' }}>
                <a
                  href={constantOperationStops[gtfsId][locale].link}
                  target="_blank"
                  rel="noreferrer"
                >
                  {constantOperationStops[gtfsId][locale].link}
                </a>
              </span>
            </div>
          </div>
        ) : (
          <>
            <StopNearYouDepartureRowContainer
              currentTime={currentTime}
              mode={vehicleMode}
              stopTimes={stop.stoptimesWithoutPatterns}
              isStation={isStation && vehicleMode !== 'SUBWAY'}
              openCapacityModal={() => setCapacityModalOpen(true)}
              isParentTabActive={isParentTabActive}
            />
            <Link
              className="stop-near-you-more-departures"
              as="button"
              onClick={e => {
                e.stopPropagation();
              }}
              to={linkAddress}
            >
              <FormattedMessage
                id="more-departures"
                defaultMessage="More departures"
              />
            </Link>
          </>
        )}
      </div>
      {capacityModalOpen && (
        <CapacityModal onClose={() => setCapacityModalOpen(false)} />
      )}
    </span>
  );
}

StopNearYou.propTypes = {
  stop: fragmentRefShape.isRequired,
  isParentTabActive: PropTypes.bool.isRequired,
};
