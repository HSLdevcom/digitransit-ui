import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { configShape, legShape } from '../../../util/shapes';
import { epochToTime } from '../../../util/timeUtils';
import Duration from '../Duration';
import { getFaresFromLegs, shouldShowFareInfo } from '../../../util/fareUtils';
import localizedUrl from '../../../util/urlUtils';

function NaviBottom(
  { setNavigation, arrival, time, legs, currentLanguage },
  { config },
) {
  const handleClose = useCallback(() => {
    addAnalyticsEvent({
      category: 'Itinerary',
      event: 'navigator',
      action: 'cancel_navigation',
    });
    setNavigation(false);
  }, [setNavigation]);
  const handleTicketButtonClick = useCallback(e => e.stopPropagation(), []);

  const isTicketSaleActive =
    !config.hideNaviTickets &&
    shouldShowFareInfo(config, legs) &&
    getFaresFromLegs(legs, config)?.find(f => !f.isUnknown);

  const remainingDuration =
    arrival >= time ? <Duration duration={arrival - time} /> : null;

  const sheetClasses = cx('navi-bottom-sheet', {
    'ticket-link': isTicketSaleActive,
  });

  const closeButton = (
    <button type="button" onClick={handleClose} className="navi-close-button">
      <FormattedMessage id="navigation-quit" />
    </button>
  );

  const durationDiv = remainingDuration && (
    <div className="navi-time" aria-live="polite" role="status">
      <FormattedMessage id="travel-time-label">
        {msg => <span className="sr-only">{msg}</span>}
      </FormattedMessage>
      {remainingDuration}
      <FormattedMessage id="arriving-at">
        {msg => <span className="sr-only">{msg}</span>}
      </FormattedMessage>
      <FormattedMessage id="at-time">
        {msg => (
          <span className="navi-daytime">
            {msg} {epochToTime(arrival, config)}
          </span>
        )}
      </FormattedMessage>
    </div>
  );

  const [FirstElement, SecondElement] = isTicketSaleActive
    ? [closeButton, durationDiv]
    : [durationDiv, closeButton];

  return (
    <div className={sheetClasses}>
      {FirstElement}
      {SecondElement}
      {isTicketSaleActive && (
        /* TODO HSL hack, make link below configurable */ <button
          type="button"
          className="navi-ticket-button"
        >
          <a
            onClick={handleTicketButtonClick}
            href={localizedUrl(config.ticketLink, currentLanguage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FormattedMessage id="navigation-ticket" />
          </a>
        </button>
      )}
    </div>
  );
}

NaviBottom.propTypes = {
  setNavigation: PropTypes.func.isRequired,
  arrival: PropTypes.number.isRequired,
  time: PropTypes.number.isRequired,
  legs: PropTypes.arrayOf(legShape).isRequired,
  currentLanguage: PropTypes.string.isRequired,
};

NaviBottom.contextTypes = {
  config: configShape.isRequired,
};

const connectedComponent = connectToStores(
  NaviBottom,
  ['PreferencesStore'],
  context => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { connectedComponent as default, NaviBottom as Component };
