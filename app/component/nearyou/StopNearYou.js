import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'found';
import Modal from '@hsl-fi/modal';
import { stopShape, relayShape } from '../../util/shapes';
import { hasEntitiesOfType } from '../../util/alertUtils';
import { stopPagePath } from '../../util/path';
import { AlertEntityType } from '../../constants';
import NearYouHeader from './NearYouHeader';
import AlertBanner from '../AlertBanner';
import StopNearYouDepartureRowContainer from './StopNearYouDepartureRowContainer';
import CapacityModal from '../CapacityModal';
import { useTranslationsContext } from '../../util/useTranslationsContext';
import { useConfigContext } from '../../configurations/ConfigContext';

const StopNearYou = ({ stop, currentTime, relay, isParentTabActive }) => {
  const config = useConfigContext();
  const intl = useTranslationsContext();
  if (!stop.stoptimesWithoutPatterns) {
    return null;
  }
  const timeRef = useRef(currentTime);
  const [capacityModalOpen, setCapacityModalOpen] = useState(false);
  const stopMode = stop.stoptimesWithoutPatterns[0]?.trip.route.mode;
  const { gtfsId } = stop;

  useEffect(() => {
    if (isParentTabActive && currentTime - timeRef.current > 30) {
      relay.refetch(oldVariables => {
        return { ...oldVariables, stopId: gtfsId, startTime: currentTime };
      }, null);
      timeRef.current = currentTime;
    }
  }, [currentTime, isParentTabActive]);

  const isStation = stop.locationType === 'STATION';
  const linkAddress = stopPagePath(isStation, gtfsId);
  const { constantOperationStops } = config;
  const { locale } = intl;
  const isConstantOperation = constantOperationStops[gtfsId];
  const filteredAlerts = stop.alerts.filter(alert =>
    hasEntitiesOfType(alert, AlertEntityType.Stop),
  );

  return (
    <span role="listitem">
      <div className="stop-near-you-container">
        <NearYouHeader
          stop={stop}
          desc={stop.desc}
          isStation={isStation}
          linkAddress={linkAddress}
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
              mode={stopMode}
              stopTimes={stop.stoptimesWithoutPatterns}
              isStation={isStation && stopMode !== 'SUBWAY'}
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
      <Modal
        appElement="#app"
        contentLabel="Capacity modal"
        closeButtonLabel="Close"
        variant="small"
        isOpen={capacityModalOpen}
        onCrossClick={() => setCapacityModalOpen(false)}
      >
        <CapacityModal config={config} />
      </Modal>
    </span>
  );
};

StopNearYou.propTypes = {
  stop: stopShape.isRequired,
  currentTime: PropTypes.number.isRequired,
  relay: relayShape.isRequired,
  isParentTabActive: PropTypes.bool.isRequired,
};

export default StopNearYou;
