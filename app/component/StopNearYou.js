import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import { Link } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { PREFIX_STOPS, PREFIX_TERMINALS } from '../util/path';
import StopNearYouHeader from './StopNearYouHeader';
import AlertBanner from './AlertBanner';
import StopNearYouDepartureRowContainer from './StopNearYouDepartureRowContainer';

const StopNearYou = (
  { stop, desc, stopId, currentTime, currentMode, relay },
  { config, intl },
) => {
  const stopOrStation = stop.parentStation ? stop.parentStation : stop;
  const stopMode = stopOrStation.stoptimesWithoutPatterns[0]?.trip.route.mode;
  useEffect(() => {
    let id = stop.gtfsId;
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
  const isStation = !!stop.parentStation || !!stopId;
  const gtfsId =
    (stop.parentStation && stop.parentStation.gtfsId) || stop.gtfsId;
  const linkAddress = isStation
    ? `/${PREFIX_TERMINALS}/${gtfsId}`
    : `/${PREFIX_STOPS}/${gtfsId}`;

  const { constantOperationStops } = config;
  const { locale } = intl;
  const isConstantOperation = constantOperationStops[stop.gtfsId];
  return (
    <span role="listitem">
      <div className="stop-near-you-container">
        <StopNearYouHeader
          stop={stopOrStation}
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
        {stop.alerts.length > 0 && (
          <AlertBanner
            alerts={stop.alerts}
            linkAddress={`${linkAddress}/hairiot`}
          />
        )}
        {isConstantOperation ? (
          <div className="stop-constant-operation-container bottom-margin">
            <div style={{ width: '85%' }}>
              <span>{constantOperationStops[stop.gtfsId][locale].text}</span>
              <span style={{ display: 'inline-block' }}>
                <a href={constantOperationStops[stop.gtfsId][locale].link}>
                  {constantOperationStops[stop.gtfsId][locale].link}
                </a>
              </span>
            </div>
          </div>
        ) : (
          <>
            <StopNearYouDepartureRowContainer
              currentTime={currentTime}
              mode={stopMode}
              stopTimes={stopOrStation.stoptimesWithoutPatterns}
              isStation={isStation && stopMode !== 'SUBWAY'}
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
    </span>
  );
};

const connectedComponent = connectToStores(
  StopNearYou,
  ['TimeStore'],
  (context, props) => {
    return {
      ...props,
      currentTime: context.getStore('TimeStore').getCurrentTime().unix(),
    };
  },
);

StopNearYou.propTypes = {
  stop: PropTypes.object.isRequired,
  stopId: PropTypes.string,
  currentTime: PropTypes.number.isRequired,
  currentMode: PropTypes.string.isRequired,
  desc: PropTypes.string,
  relay: PropTypes.any,
};

StopNearYou.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default connectedComponent;
