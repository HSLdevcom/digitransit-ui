import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import { Link } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Modal from '@hsl-fi/modal';
import { stopShape, configShape, relayShape } from '../../util/shapes';
import { hasEntitiesOfType } from '../../util/alertUtils';
import { stopPagePath, PREFIX_DISRUPTION } from '../../util/path';
import { AlertEntityType } from '../../constants';
import StopNearYouHeader from './StopNearYouHeader';
import AlertBanner from '../AlertBanner';
import StopNearYouDepartureRowContainer from './StopNearYouDepartureRowContainer';
import CapacityModal from '../CapacityModal';

const StopNearYou = (
  { stop, desc, stopId, currentTime, currentMode, relay, isParentTabActive },
  { config, intl },
) => {
  if (!stop.stoptimesWithoutPatterns) {
    return null;
  }
  const [capacityModalOpen, setCapacityModalOpen] = useState(false);
  const stopMode = stop.stoptimesWithoutPatterns[0]?.trip.route.mode;
  const { gtfsId } = stop;

  useEffect(() => {
    let id = gtfsId;
    if (stopId) {
      id = stopId;
    }
    if (currentMode === stopMode || !currentMode) {
      relay?.refetch(oldVariables => {
        return { ...oldVariables, stopId: id, startTime: currentTime };
      }, null);
    }
  }, [currentTime, currentMode]);

  const description = desc || stop.desc;
  const isStation = stop.locationType === 'STATION';
  const linkAddress = stopPagePath(isStation, gtfsId, PREFIX_DISRUPTION);

  const { constantOperationStops } = config;
  const { locale } = intl;
  const isConstantOperation = constantOperationStops[gtfsId];
  const filteredAlerts = stop.alerts.filter(alert =>
    hasEntitiesOfType(alert, AlertEntityType.Stop),
  );
  return (
    <span role="listitem">
      <div className="stop-near-you-container">
        <StopNearYouHeader
          stop={stop}
          desc={description}
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
              setCapacityModalOpen={() => setCapacityModalOpen(true)}
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

const connectedComponent = connectToStores(
  StopNearYou,
  ['TimeStore'],
  (context, props) => {
    return {
      ...props,
      currentTime: context.getStore('TimeStore').getCurrentTime(),
    };
  },
);

StopNearYou.propTypes = {
  stop: stopShape.isRequired,
  stopId: PropTypes.string,
  currentTime: PropTypes.number.isRequired,
  currentMode: PropTypes.string.isRequired,
  desc: PropTypes.string,
  relay: relayShape,
  isParentTabActive: PropTypes.bool,
};

StopNearYou.defaultProps = {
  stopId: undefined,
  desc: undefined,
  relay: undefined,
  isParentTabActive: false,
};

StopNearYou.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};

export default connectedComponent;
