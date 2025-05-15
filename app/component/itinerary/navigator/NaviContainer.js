import connectToStores from 'fluxible-addons-react/connectToStores';
import { routerShape } from 'found';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import {
  startLocationWatch,
  stopLocationWatch,
} from '../../../action/PositionActions';
import { legTime, legTimeStr } from '../../../util/legUtils';
import { legShape, relayShape } from '../../../util/shapes';
import { useRealtimeLegs } from './hooks/useRealtimeLegs';
import NaviBottom from './NaviBottom';
import NaviCardContainer from './NaviCardContainer';
import NavigatorOutroModal from './navigatoroutro/NavigatorOutroModal';
import NaviStarter from './NaviStarter';
import { DESTINATION_RADIUS, summaryString } from './NaviUtils';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';

const ADDITIONAL_ARRIVAL_TIME = 30000; // 30 s
const LEGLOG = true;
const TOPBAR_PADDING = 8; // pixels
const START_BUFFER = 120000; // 2 min in ms

function NaviContainer(
  {
    legs,
    focusToLeg,
    relayEnvironment,
    setNavigation,
    isNavigatorIntroDismissed,
    mapRef,
    mapLayerRef,
    updateLegs,
    forceStartAt,
    settings,
  },
  { executeAction, getStore, router },
) {
  const hasPosition = useRef(false);
  const prevPos = useRef(undefined);
  const posFrozen = useRef(0);

  let position = getStore('PositionStore').getLocationState();
  if (!position.hasLocation) {
    position = null;
  } else {
    hasPosition.current = true;
  }
  const { vehicles } = getStore('RealTimeInformationStore');

  // TODO disable after testing
  const simulateTransferProblem = LEGLOG && settings.bikeSpeed > 8;

  const {
    realTimeLegs,
    time,
    tailLength,
    firstLeg,
    lastLeg,
    previousLeg,
    currentLeg,
    nextLeg,
    startItinerary,
    loading,
  } = useRealtimeLegs(
    relayEnvironment,
    legs,
    position,
    vehicles,
    updateLegs,
    forceStartAt,
    simulateTransferProblem,
  );

  useEffect(() => {
    setTimeout(() => mapRef?.enableMapTracking(), 10); // try always, shows annoying notifier
  }, [mapRef, hasPosition.current]);

  useEffect(() => {
    if (position && prevPos.current) {
      if (
        prevPos.current.lat === position.lat &&
        prevPos.current.lon === position.lon
      ) {
        posFrozen.current += 1;
        if (posFrozen.current === 3) {
          executeAction(stopLocationWatch);
          setTimeout(() => executeAction(startLocationWatch), 10);
        }
      } else {
        posFrozen.current = 0;
      }
    }
    prevPos.current = position;
  }, [time]);

  useEffect(() => {
    if (firstLeg && time > legTime(firstLeg.start) - START_BUFFER) {
      startItinerary(Date.now());
    }
  }, [firstLeg]);

  if (loading || !realTimeLegs?.length) {
    return null;
  }

  const arrivalTime = legTime(lastLeg.end);
  const isDestinationReached =
    (currentLeg === lastLeg || time > arrivalTime) &&
    position &&
    tailLength <= DESTINATION_RADIUS;
  const arrivalMargin = position
    ? 10 * ADDITIONAL_ARRIVAL_TIME
    : ADDITIONAL_ARRIVAL_TIME;
  const isPastExpectedArrival = time > arrivalTime + arrivalMargin;
  const isJourneyCompleted = isDestinationReached || isPastExpectedArrival;

  if (LEGLOG) {
    // eslint-disable-next-line
    console.log(...summaryString(realTimeLegs, time, previousLeg, currentLeg, nextLeg));
  }

  const containerTopPosition =
    mapLayerRef.current.getBoundingClientRect().top + TOPBAR_PADDING;

  const isPastStart = time > legTime(firstLeg.start) || !!firstLeg.forceStart;

  const handleNavigatorEndClick = () => {
    addAnalyticsEvent({
      category: 'Itinerary',
      event: 'navigator',
      action: 'navigation_end_manual',
    });
    router.push('/');
  };

  return (
    <>
      <NaviStarter
        containerTopPosition={containerTopPosition}
        time={legTimeStr(firstLeg.start)}
        startItinerary={startItinerary}
        isPastStart={isPastStart}
      />
      {isPastStart && (
        <NaviCardContainer
          legs={realTimeLegs}
          focusToLeg={position ? null : focusToLeg}
          time={time}
          position={position}
          tailLength={tailLength}
          currentLeg={time > arrivalTime ? previousLeg : currentLeg}
          nextLeg={nextLeg}
          firstLeg={firstLeg}
          lastLeg={lastLeg}
          isJourneyCompleted={isJourneyCompleted}
          previousLeg={previousLeg}
          containerTopPosition={containerTopPosition}
          settings={settings}
        />
      )}
      {isJourneyCompleted && isNavigatorIntroDismissed && (
        <NavigatorOutroModal
          destination={lastLeg.to.name}
          onClose={handleNavigatorEndClick}
        />
      )}
      {!isJourneyCompleted && (
        <NaviBottom
          setNavigation={setNavigation}
          arrival={arrivalTime}
          time={time}
          legs={legs}
        />
      )}
    </>
  );
}

NaviContainer.propTypes = {
  legs: PropTypes.arrayOf(legShape).isRequired,
  focusToLeg: PropTypes.func.isRequired,
  relayEnvironment: relayShape.isRequired,
  setNavigation: PropTypes.func.isRequired,
  isNavigatorIntroDismissed: PropTypes.bool,
  // eslint-disable-next-line
  mapRef: PropTypes.object,
  mapLayerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
    .isRequired,
  updateLegs: PropTypes.func.isRequired,
  forceStartAt: PropTypes.number,
  // eslint-disable-next-line
  settings: PropTypes.object.isRequired,
};

NaviContainer.contextTypes = {
  executeAction: PropTypes.func,
  getStore: PropTypes.func.isRequired,
  router: routerShape.isRequired,
};

NaviContainer.defaultProps = {
  mapRef: undefined,
  isNavigatorIntroDismissed: false,
  forceStartAt: undefined,
};

const connectedComponent = connectToStores(
  NaviContainer,
  ['MessageStore'],
  context => ({
    messages: context.getStore('MessageStore').getMessages(),
  }),
);

export default connectedComponent;
