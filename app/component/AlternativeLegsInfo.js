import PropTypes from 'prop-types';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import React from 'react';
import Icon from './Icon';
import { isKeyboardSelectionEvent } from '../util/browser';

const AlternativeLegsInfo = ({ legs, showAlternativeLegs, toggle }) => {
  const message = (showAlternativeLegs && (
    <FormattedMessage
      className="alternative-leg-info"
      id="itinerary-hide-alternative-legs"
      defaultMessage="Hide alternative legs"
    />
  )) || (
    <FormattedMessage
      className="alternative-leg-info"
      id="alternative-legs"
      values={{
        leg1: legs[0].route.shortName,
        leg2: legs[1].route.shortName,
        startTime2: (
          <span className="realtime" style={{ fontWeight: 500 }}>
            {moment(legs[1].startTime).format('HH:mm')}
          </span>
        ),
        startTime1: (
          <span className="realtime" style={{ fontWeight: 500 }}>
            {moment(legs[0].startTime).format('HH:mm')}
          </span>
        ),
      }}
      defaultMessage="Also {leg1} at {startTime1} and {leg2} at {startTime2}"
    />
  );

  return legs ? (
    <div
      role="button"
      tabIndex="0"
      className={cx(
        'intermediate-stop-info-container',
        'intermediate-stops-clickable',
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
  ) : null;
};

AlternativeLegsInfo.propTypes = {
  legs: PropTypes.array.isRequired,
  showAlternativeLegs: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};
export default AlternativeLegsInfo;
