import { matchShape, routerShape } from 'found';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { intlShape } from 'react-intl';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { isAnyLegPropertyIdentical, legTime } from '../../../util/legUtils';
import { configShape, legShape } from '../../../util/shapes';
import { getTopics, updateClient } from '../ItineraryPageUtils';
import NaviCard from './NaviCard';
import NaviStack from './NaviStack';
import {
  getAdditionalMessages,
  getItineraryAlerts,
  getTransitLegState,
  itinerarySearchPath,
  LEGTYPE,
} from './NaviUtils';
import usePrevious from './hooks/usePrevious';

const HIDE_TOPCARD_DURATION = 2000; // milliseconds

function addMessages(incomingMessages, newMessages) {
  newMessages.forEach(m => {
    incomingMessages.set(m.id, m);
  });
}

const getLegType = (leg, firstLeg, time, interlineWithPreviousLeg) => {
  let legType;
  if (time < legTime(firstLeg.start)) {
    if (!firstLeg.forceStart) {
      legType = LEGTYPE.PENDING;
    } else {
      legType = LEGTYPE.WAIT;
    }
  } else if (leg) {
    legType = leg.transitLeg ? LEGTYPE.TRANSIT : LEGTYPE.MOVE;
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
    currentLeg,
    nextLeg,
    firstLeg,
    lastLeg,
    previousLeg,
    isJourneyCompleted,
    containerTopPosition,
    settings,
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
  const focusRef = useRef(false);

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
    addAnalyticsEvent({
      category: 'Itinerary',
      event: 'navigator',
      action: 'start_navigation',
    });
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
        settings,
      ),
    );

    if (nextLeg?.transitLeg) {
      // Messages for NaviStack.
      addMessages(incomingMessages, [
        ...getTransitLegState(nextLeg, intl, messages, time, settings),
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
    if (legChanged) {
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

    return () => clearTimeout(timeoutId);
  }, [time, firstLeg]);

  // LegChange fires animation, we need to keep the old data until card goes out of the view.
  const l = legChanging ? previousLeg : currentLeg;
  const legType = getLegType(
    l,
    firstLeg,
    time,
    nextLeg?.interlineWithPreviousLeg,
  );

  let className;
  if (isJourneyCompleted || legChanging) {
    className = 'hide-card';
  } else {
    className = 'show-card';
  }
  return (
    <div
      className={`navi-card-container ${className}`}
      style={{ top: containerTopPosition }}
      aria-live={legChanging ? undefined : 'polite'}
      aria-hidden={legChanging ? 'true' : 'false'}
    >
      <NaviCard
        leg={l}
        nextLeg={nextLeg}
        legType={legType}
        time={time}
        position={position}
        tailLength={tailLength}
        cardAnimation={className}
      />
      {activeMessages.length > 0 && (
        <NaviStack
          messages={activeMessages}
          handleRemove={handleRemove}
          cardAnimation={className}
        />
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
    watchId: PropTypes.number,
  }),
  tailLength: PropTypes.number.isRequired,
  containerTopPosition: PropTypes.number.isRequired,
  currentLeg: legShape,
  nextLeg: legShape,
  firstLeg: legShape,
  lastLeg: legShape,
  previousLeg: legShape,
  isJourneyCompleted: PropTypes.bool,
  // eslint-disable-next-line
  settings: PropTypes.object.isRequired,
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
