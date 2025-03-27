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

const ADDITIONAL_ARRIVAL_TIME = 300000; // 5 min in ms
const LEGLOG = true;
const TOPBAR_PADDING = 8; // pixels

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

  if (loading || !realTimeLegs?.length) {
    return null;
  }

  const arrivalTime = legTime(lastLeg.end);
  const isDestinationReached =
    (currentLeg === lastLeg || time > arrivalTime) &&
    position &&
    tailLength <= DESTINATION_RADIUS;
  const isPastExpectedArrival = time > arrivalTime + ADDITIONAL_ARRIVAL_TIME;
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
        />
      )}
      {isJourneyCompleted && isNavigatorIntroDismissed && (
        <NavigatorOutroModal
          destination={lastLeg.to.name}
          onClose={handleNavigatorEndClick}
        />
      )}
      <NaviBottom
        setNavigation={setNavigation}
        arrival={arrivalTime}
        time={time}
      />
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
