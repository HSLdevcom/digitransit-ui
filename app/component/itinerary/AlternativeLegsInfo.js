import PropTypes from 'prop-types';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import Icon from '../Icon';
import { isKeyboardSelectionEvent } from '../../util/browser';
import { legShape } from '../../util/shapes';
import { legTimeStr } from '../../util/legUtils';

export default function AlternativeLegsInfo({
  legs,
  showAlternativeLegs,
  toggle,
}) {
  let values = {
    leg1: (
      <>
        <span aria-hidden="true">{legs[0].route.shortName}</span>
        <span className="sr-only">
          {legs[0].route.shortName?.toLowerCase()}
        </span>
      </>
    ),
    startTime1: (
      <span
        className={cx({ realtime: legs[0].realTime })}
        style={{ fontWeight: 500 }}
      >
        {legTimeStr(legs[0].start)}
        {legs[0].realTime && (
          <span className="sr-only">
            <FormattedMessage id="realtime" />
          </span>
        )}
      </span>
    ),
  };
  if (legs.length > 1) {
    values = {
      ...values,
      leg2: (
        <>
          <span aria-hidden="true">{legs[1].route.shortName}</span>
          <span className="sr-only">
            {legs[1].route.shortName?.toLowerCase()}
          </span>
        </>
      ),
      startTime2: (
        <span
          className={cx({ realtime: legs[1].realTime })}
          style={{ fontWeight: 500 }}
        >
          {legTimeStr(legs[1].start)}
          {legs[1].realTime && (
            <span className="sr-only">
              <FormattedMessage id="realtime" />
            </span>
          )}
        </span>
      ),
    };
  }

  const message =
    (showAlternativeLegs && (
      <FormattedMessage
        className="alternative-leg-info"
        id="itinerary-hide-alternative-legs"
        defaultMessage="Hide alternative legs"
      />
    )) ||
    (legs.length > 1 ? (
      <FormattedMessage
        className="alternative-leg-info"
        id="alternative-legs"
        values={values}
        defaultMessage="Also {leg1} at {startTime1} and {leg2} at {startTime2}"
      />
    ) : (
      <FormattedMessage
        className="alternative-leg-info"
        id="alternative-legs-single"
        values={values}
        defaultMessage="Also {leg1} at {startTime1}"
      />
    ));

  return (
    <div
      role="button"
      tabIndex="0"
      className={cx(
        'alternative-legs-info-container',
        'alternative-legs-clickable',
        'cursor-pointer',
        { open: showAlternativeLegs },
      )}
      onClick={() => toggle()}
      onKeyPress={e => {
        if (isKeyboardSelectionEvent(e)) {
          e.stopPropagation();
          toggle();
        }
      }}
    >
      <div className="alternative-legs-information">
        {message}
        <Icon
          img="icon-icon_arrow-collapse--right"
          className="itinerary-search-icon"
        />
      </div>
    </div>
  );
}

AlternativeLegsInfo.propTypes = {
  legs: PropTypes.arrayOf(legShape).isRequired,
  showAlternativeLegs: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};
