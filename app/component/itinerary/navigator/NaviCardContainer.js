import distance from '@digitransit-search-util/digitransit-search-util-distance';
import { matchShape, routerShape } from 'found';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { intlShape } from 'react-intl';
import {
  isAnyLegPropertyIdentical,
  legTime,
  legTimeStr,
} from '../../../util/legUtils';
import { configShape, legShape } from '../../../util/shapes';
import { getTopics, updateClient } from '../ItineraryPageUtils';
import NaviCard from './NaviCard';
import NaviStack from './NaviStack';
import NaviStarter from './NaviStarter';
import {
  DESTINATION_RADIUS,
  getAdditionalMessages,
  getItineraryAlerts,
  getTransitLegState,
  itinerarySearchPath,
  LEGTYPE,
} from './NaviUtils';
import usePrevious from './hooks/usePrevious';

const COUNT_AT_LEG_END = 2; // update cycles within DESTINATION_RADIUS from leg.to
const TOPBAR_PADDING = 8; // pixels
const HIDE_TOPCARD_DURATION = 2000; // milliseconds

function addMessages(incomingMessages, newMessages) {
  newMessages.forEach(m => {
    incomingMessages.set(m.id, m);
  });
}

const getLegType = (
  leg,
  firstLeg,
  time,
  countAtLegEnd,
  interlineWithPreviousLeg,
) => {
  let legType;
  if (!firstLeg.forceStart && time < legTime(firstLeg.start)) {
    legType = LEGTYPE.PENDING;
  } else if (leg) {
    if (!leg.transitLeg) {
      if (countAtLegEnd >= COUNT_AT_LEG_END) {
        legType = LEGTYPE.WAIT;
      } else {
        legType = LEGTYPE.MOVE;
      }
    } else {
      legType = LEGTYPE.TRANSIT;
    }
  } else {
    legType = interlineWithPreviousLeg ? LEGTYPE.WAIT_IN_VEHICLE : LEGTYPE.WAIT;
  }
  return legType;
};

function NaviCardContainer(
  {
    focusToLeg,
    time,
    legs,
    position,
    tailLength,
    mapLayerRef,
    currentLeg,
    nextLeg,
    firstLeg,
    lastLeg,
    previousLeg,
    isJourneyCompleted,
    startItinerary,
  },
  context,
) {
  // All notifications including those user has dismissed.
  const [messages, setMessages] = useState(new Map());
  // notifications that are shown to the user.
  const [activeMessages, setActiveMessages] = useState([]);
  const [legChanging, setLegChanging] = useState(false);
  const { isEqual: legChanged } = usePrevious(currentLeg, (prev, current) =>
    isAnyLegPropertyIdentical(prev, current, ['legId', 'mode']),
  );
  const { isEqual: forceStart } = usePrevious(firstLeg?.forceStart);
  const focusRef = useRef(false);
  // Destination counter. How long user has been at the destination. * 10 seconds
  const legEndRef = useRef(0);
  const { intl, config, match, router } = context;
  const handleRemove = index => {
    const msg = messages.get(activeMessages[index].id);
    msg.closed = true; // remember closing action
    setActiveMessages(activeMessages.filter((_, i) => i !== index));
  };

  // track only relevant vehicles for the journey.
  const getNaviTopics = () =>
    getTopics(
      legs.filter(leg => legTime(leg.end) >= time),
      config,
    );

  const makeNewItinerarySearch = () => {
    const path = itinerarySearchPath(
      time,
      currentLeg,
      nextLeg,
      position,
      match.params.to,
    );
    router.push(path);
  };

  useEffect(() => {
    updateClient(getNaviTopics(), context);
  }, []);

  useEffect(() => {
    const incomingMessages = new Map();

    // Alerts for NaviStack
    addMessages(
      incomingMessages,
      getItineraryAlerts(
        legs,
        time,
        position,
        tailLength,
        intl,
        messages,
        makeNewItinerarySearch,
        config,
      ),
    );

    if (
      match.location.query?.debug !== undefined &&
      position &&
      !messages.get('debug')?.closed
    ) {
      const info1 = `lat: ${position.lat} lon: ${position.lon}`;
      const info2 = `status: ${position.status}`;
      const info3 = `locations: ${position.locationCount} watchId: ${position.watchId}`;

      addMessages(incomingMessages, [
        {
          severity: 'INFO',
          content: (
            <div className="navi-info-content">
              <span>{info1}</span>
              <span>{info2}</span>
              <span>{info3}</span>
            </div>
          ),
          id: 'debug',
        },
      ]);
    }

    if (nextLeg?.transitLeg) {
      // Messages for NaviStack.
      addMessages(incomingMessages, [
        ...getTransitLegState(nextLeg, intl, messages, time),
        ...getAdditionalMessages(
          currentLeg,
          nextLeg,
          firstLeg,
          time,
          config,
          messages,
        ),
      ]);
    }
    let timeoutId;
    if (legChanged || forceStart) {
      updateClient(getNaviTopics(), context);
      setLegChanging(true);
      timeoutId = setTimeout(() => {
        setLegChanging(false);
      }, HIDE_TOPCARD_DURATION);
      if (currentLeg) {
        focusToLeg?.(currentLeg);
      }
    }

    // Update messages if there are changes
    const expired = activeMessages.find(m => m.expiresOn < time);
    if (incomingMessages.size || expired) {
      // Current active messages. Filter away expired messages.
      const previousValidMessages = expired
        ? activeMessages.filter(m => !m.expiresOn || m.expiresOn > time)
        : activeMessages;

      // handle messages that are updated.
      const keptMessages = previousValidMessages.filter(
        msg => !incomingMessages.get(msg.id),
      );
      const newMessages = Array.from(incomingMessages.values());
      setActiveMessages([...keptMessages, ...newMessages]);
      setMessages(new Map([...messages, ...incomingMessages]));
    }

    if (!focusRef.current && focusToLeg) {
      // handle initial focus when not tracking
      if (currentLeg) {
        focusToLeg(currentLeg);
      } else if (time < legTime(firstLeg.start)) {
        focusToLeg(firstLeg);
      } else {
        focusToLeg(nextLeg || lastLeg);
      }
      focusRef.current = true;
    }

    // User position and distance from currentleg endpoint.
    if (
      position &&
      currentLeg &&
      nextLeg && // itinerary end has its own logic
      distance(position, currentLeg.to) <= DESTINATION_RADIUS
    ) {
      legEndRef.current += 1;
    } else {
      // Todo: this works in transit legs, but do we need additional logic for bikes / scooters?
      legEndRef.current = 0;
    }

    return () => clearTimeout(timeoutId);
  }, [time, firstLeg]);

  // LegChange fires animation, we need to keep the old data until card goes out of the view.
  const l = legChanging ? previousLeg : currentLeg;
  const legType = getLegType(
    l,
    firstLeg,
    time,
    legEndRef.current,
    nextLeg?.interlineWithPreviousLeg,
  );

  const containerTopPosition =
    mapLayerRef.current.getBoundingClientRect().top + TOPBAR_PADDING;
  let className;
  if (isJourneyCompleted) {
    className = 'slide-out';
  } else if (legChanging) {
    className = 'hide-card';
  } else {
    className = 'show-card';
  }
  return (
    <div
      className={`navi-card-container ${className}`}
      style={{ top: containerTopPosition }}
    >
      {(!firstLeg.forceStart && time < legTime(firstLeg.start)) ||
      (firstLeg.forceStart && time < legTime(firstLeg.start) && legChanging) ? (
        <NaviStarter
          time={legTimeStr(firstLeg.start)}
          startItinerary={startItinerary}
        />
      ) : (
        <NaviCard
          leg={l}
          nextLeg={nextLeg}
          legType={legType}
          startTime={legTimeStr(firstLeg.start)}
          time={time}
          position={position}
          tailLength={tailLength}
        />
      )}
      {activeMessages.length > 0 && (
        <NaviStack messages={activeMessages} handleRemove={handleRemove} />
      )}
    </div>
  );
}

NaviCardContainer.propTypes = {
  focusToLeg: PropTypes.func,
  time: PropTypes.number.isRequired,
  legs: PropTypes.arrayOf(legShape).isRequired,
  position: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
    status: PropTypes.string,
    locationCount: PropTypes.number,
    watchId: PropTypes.string,
  }),
  mapLayerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
    .isRequired,
  tailLength: PropTypes.number.isRequired,
  currentLeg: legShape,
  nextLeg: legShape,
  firstLeg: legShape,
  lastLeg: legShape,
  previousLeg: legShape,
  isJourneyCompleted: PropTypes.bool,
  startItinerary: PropTypes.func,
};

NaviCardContainer.defaultProps = {
  focusToLeg: undefined,
  position: undefined,
  currentLeg: undefined,
  nextLeg: undefined,
  firstLeg: undefined,
  lastLeg: undefined,
  previousLeg: undefined,
  isJourneyCompleted: false,
  startItinerary: () => {},
};

NaviCardContainer.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  executeAction: PropTypes.func.isRequired,
  getStore: PropTypes.func.isRequired,
};

export default NaviCardContainer;
