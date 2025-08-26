import connectToStores from 'fluxible-addons-react/connectToStores';
import { routerShape } from 'found';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import {
  startLocationWatch,
  stopLocationWatch,
} from '../../../action/PositionActions';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { legTime, legTimeStr } from '../../../util/legUtils';
import { relayShape } from '../../../util/shapes';
import { useItineraryContext } from '../context/ItineraryContext';
import { useRealtimeLegs } from './hooks/useRealtimeLegs';
import NaviBottom from './NaviBottom';
import NaviCardContainer from './NaviCardContainer';
import NavigatorOutroModal from './navigatoroutro/NavigatorOutroModal';
import NaviStarter from './NaviStarter';
import { DESTINATION_RADIUS, summaryString } from './NaviUtils';

const ADDITIONAL_ARRIVAL_TIME = 30000; // 30 s
const LEGLOG = true;
const TOPBAR_PADDING = 8; // pixels
const START_BUFFER = 120000; // 2 min in ms

function NaviContainer(
  {
    focusToLeg,
    relayEnvironment,
    setNavigation,
    isNavigatorIntroDismissed,
    mapRef,
    mapLayerRef,
    settings,
  },
  { executeAction, getStore, router },
) {
  const hasPosition = useRef(false);
  const prevPos = useRef(undefined);
  const posFrozen = useRef(0);
  const [starterReady, setStarterReady] = useState(false);

  let position = getStore('PositionStore').getLocationState();
  if (!position.hasLocation) {
    position = null;
  } else {
    hasPosition.current = true;
  }
  const { vehicles } = getStore('RealTimeInformationStore');

  const { itinerary, params } = useItineraryContext();

  // TODO disable after testing
  const simulateTransferProblem = LEGLOG && settings.bikeSpeed > 8;

  const {
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
    position,
    vehicles,
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
  }, [params.updatedAt]);

  useEffect(() => {
    if (firstLeg && !starterReady) {
      if (params.updatedAt > legTime(firstLeg.start) - START_BUFFER) {
        startItinerary(Date.now() - 1);
      }
      setStarterReady(true);
    }
  }, [firstLeg]);

  if (loading || !starterReady) {
    return null;
  }

  const arrivalTime = legTime(lastLeg.end);
  const isDestinationReached =
    (currentLeg === lastLeg || params.updatedAt > arrivalTime) &&
    position &&
    tailLength <= DESTINATION_RADIUS;
  const arrivalMargin = position
    ? 10 * ADDITIONAL_ARRIVAL_TIME
    : ADDITIONAL_ARRIVAL_TIME;
  const isPastExpectedArrival = params.updatedAt > arrivalTime + arrivalMargin;
  const isJourneyCompleted = isDestinationReached || isPastExpectedArrival;

  if (LEGLOG) {
    // eslint-disable-next-line
    console.log(
      ...summaryString(
        itinerary.legs,
        params.updatedAt,
        previousLeg,
        currentLeg,
        nextLeg,
      ),
    );
  }

  const containerTopPosition =
    mapLayerRef.current.getBoundingClientRect().top + TOPBAR_PADDING;

  const isPastStart =
    params.updatedAt >= legTime(firstLeg.start) || !!firstLeg.forceStart;

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
          legs={itinerary.legs}
          focusToLeg={position ? null : focusToLeg}
          time={params.updatedAt}
          position={position}
          tailLength={tailLength}
          currentLeg={params.updatedAt > arrivalTime ? previousLeg : currentLeg}
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
          time={params.updatedAt}
          legs={itinerary.legs}
        />
      )}
    </>
  );
}

NaviContainer.propTypes = {
  focusToLeg: PropTypes.func.isRequired,
  relayEnvironment: relayShape.isRequired,
  setNavigation: PropTypes.func.isRequired,
  isNavigatorIntroDismissed: PropTypes.bool,
  // eslint-disable-next-line
  mapRef: PropTypes.object,
  mapLayerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
    .isRequired,
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
};

const connectedComponent = connectToStores(
  NaviContainer,
  ['MessageStore'],
  context => ({
    messages: context.getStore('MessageStore').getMessages(),
  }),
);

export default connectedComponent;
