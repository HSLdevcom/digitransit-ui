import PropTypes from 'prop-types';
import React from 'react';
import { useFragment } from 'react-relay';
import { useRouter } from 'found';
import { FormattedMessage, useIntl } from 'react-intl';
import { planEdgeShape } from '../../util/shapes';
import Icon from '../Icon';
import ItineraryList from './ItineraryList';
import { isIOS, isSafari } from '../../util/browser';
import ItineraryNotification from './ItineraryNotification';
import { transitEdges } from './ItineraryPageUtils';
import { ItineraryListContainerPlanEdges } from './queries/ItineraryListContainerPlanEdges';

function ItineraryListContainer({
  planEdges: planEdgesRef,
  activeIndex,
  focusToHeader,
  onLater,
  onEarlier,
  settingsNotification,
  topNote,
  bottomNote,
  ...rest
}) {
  const planEdges = useFragment(ItineraryListContainerPlanEdges, planEdgesRef);
  const intl = useIntl();
  const { match } = useRouter();

  function laterButton(reversed) {
    return (
      <button
        type="button"
        aria-label={intl.formatMessage({
          id: 'set-time-later-button-label',
          defaultMessage: 'Set travel time to later',
        })}
        className={`time-navigation-btn ${
          reversed ? 'top-btn' : 'bottom-btn'
        } ${!reversed && isIOS && isSafari ? 'extra-whitespace' : ''} `}
        onClick={() => onLater()}
      >
        <Icon
          img="icon_arrow-collapse"
          className={`cursor-pointer back ${reversed ? 'arrow-up' : ''}`}
        />
        <FormattedMessage
          id="later"
          defaultMessage="Later"
          className="time-navigation-text"
        />
      </button>
    );
  }

  function earlierButton(reversed = false) {
    return (
      <button
        type="button"
        aria-label={intl.formatMessage({
          id: 'set-time-earlier-button-label',
          defaultMessage: 'Set travel time to earlier',
        })}
        className={`time-navigation-btn ${
          reversed ? 'bottom-btn' : 'top-btn'
        } ${reversed && isIOS && isSafari ? 'extra-whitespace' : ''}`}
        onClick={() => onEarlier()}
      >
        <Icon
          img="icon_arrow-collapse"
          className={`cursor-pointer ${reversed ? '' : 'arrow-up'}`}
        />
        <FormattedMessage
          id="earlier"
          defaultMessage="Earlier"
          className="time-navigation-text"
        />
      </button>
    );
  }

  function renderMoreButton(arriveBy, onTop) {
    if (onTop) {
      return arriveBy ? laterButton(true) : earlierButton();
    }
    return arriveBy ? earlierButton(true) : laterButton();
  }

  const { location } = match;
  const arriveBy = location.query.arriveBy === 'true';
  const showEarlierLaterButtons =
    transitEdges(planEdges).length > 0 && !match.params.hash;
  return (
    <div className="summary">
      <h2 className="sr-only">
        <FormattedMessage
          id="itinerary-summary-page.description"
          defaultMessage="Route suggestions"
        />
      </h2>
      {showEarlierLaterButtons && renderMoreButton(arriveBy, true)}
      {topNote && <ItineraryNotification bodyId={topNote} />}
      <ItineraryList
        planEdges={planEdges}
        activeIndex={activeIndex}
        focusToHeader={focusToHeader}
        {...rest}
      />
      {settingsNotification && (
        <ItineraryNotification
          headerId="settings-missing-itineraries-header"
          bodyId="settings-missing-itineraries-body"
          iconId="icon_settings"
        />
      )}
      {bottomNote && <ItineraryNotification bodyId={bottomNote} />}
      {showEarlierLaterButtons && renderMoreButton(arriveBy, false)}
    </div>
  );
}

ItineraryListContainer.propTypes = {
  planEdges: PropTypes.arrayOf(planEdgeShape).isRequired,
  activeIndex: PropTypes.number.isRequired,
  focusToHeader: PropTypes.func.isRequired,
  onLater: PropTypes.func.isRequired,
  onEarlier: PropTypes.func.isRequired,
  settingsNotification: PropTypes.bool,
  topNote: PropTypes.string,
  bottomNote: PropTypes.string,
};

ItineraryListContainer.defaultProps = {
  settingsNotification: false,
  topNote: undefined,
  bottomNote: undefined,
};

export default ItineraryListContainer;
