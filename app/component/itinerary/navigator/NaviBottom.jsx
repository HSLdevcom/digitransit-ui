import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { legShape } from '../../../util/shapes';
import { epochToTime, durationToString } from '../../../util/timeUtils';
import { getFaresFromLegs, shouldShowFareInfo } from '../../../util/fareUtils';
import localizedUrl from '../../../util/urlUtils';
import { useConfigContext } from '../../../configurations/ConfigContext';

export default function NaviBottom({ setNavigation, arrival, time, legs }) {
  const intl = useIntl();
  const config = useConfigContext();
  const currentLanguage = config.language;

  const handleClose = () => {
    addAnalyticsEvent({
      category: 'Itinerary',
      event: 'navigator',
      action: 'cancel_navigation',
    });
    setNavigation(false);
  };

  const handleTicketButtonClick = e => {
    e.stopPropagation();
  };

  const isTicketSaleActive =
    config.navigatorTicketLink &&
    shouldShowFareInfo(config, legs) &&
    getFaresFromLegs(legs, config)?.find(f => !f.isUnknown);

  const remainingDuration =
    arrival >= time ? durationToString(intl, arrival - time) : null;

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
        /* TODO HSL hack, make link below configurable */
        <a
          className="navi-ticket-button"
          href={localizedUrl(config.navigatorTicketLink, currentLanguage)}
          onClick={handleTicketButtonClick}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FormattedMessage id="navigation-ticket" />
        </a>
      )}
    </div>
  );
}

NaviBottom.propTypes = {
  setNavigation: PropTypes.func.isRequired,
  arrival: PropTypes.number.isRequired,
  time: PropTypes.number.isRequired,
  legs: PropTypes.arrayOf(legShape).isRequired,
};
