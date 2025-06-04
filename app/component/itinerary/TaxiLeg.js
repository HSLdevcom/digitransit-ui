import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import { legShape, configShape } from '../../util/shapes';
import Icon from '../Icon';
import ItineraryMapAction from './ItineraryMapAction';
import { displayDistance } from '../../util/geo-utils';
import { durationToString } from '../../util/timeUtils';
import ItineraryCircleLineWithIcon from './ItineraryCircleLineWithIcon';
import { legTimeStr, legDestination } from '../../util/legUtils';
import TaxiLinkContainer from './TaxiLinkContainer';
import { splitStringToAddressAndPlace } from '../../util/otpStrings';
import ItineraryCircleLine from './ItineraryCircleLine';

export default function TaxiLeg(props, { config, intl }) {
  const { leg, index } = props;
  const isFirstLeg = i => i === 0;
  const alternativeOperators = [
    // for testing only
  ];

  const addedPixels = alternativeOperators.length * (41 + 8); // 41px is the height of the TaxiLinkContainer and 8px is the margin
  const topBottomRatio = 0.6; // The ratio of the top and bottom portions of the vertical leg line
  const style = {
    '--taxi-leg-line-top': addedPixels
      ? `${addedPixels * topBottomRatio}px`
      : '0px',
    '--taxi-leg-line-bottom': addedPixels
      ? `${addedPixels * (1 - topBottomRatio)}px`
      : '0px',
  };

  const distance = displayDistance(
    parseInt(props.leg.distance, 10),
    config,
    intl.formatNumber,
  );
  const duration = durationToString(props.leg.duration * 1000);
  const firstLegClassName = props.index === 0 ? 'first' : '';
  const lowerCaseLegMode = props.leg.mode.toLowerCase();
  const modeClassName = 'taxi-external';

  const legDescription = (
    <span className={cx('leg-header')}>
      <FormattedMessage
        id="book-a-lift"
        defaultMessage="Use an app to book a taxi"
      />
    </span>
  );

  const [address, place] = splitStringToAddressAndPlace(leg.from.name);
  const { bookingUrl, infoUrl } = props.leg.pickupBookingInfo.contactInfo;
  return (
    <>
      {isFirstLeg(index) && (
        <div key="taxi-start" className="row itinerary-row">
          <div
            className="small-2 columns itinerary-time-column"
            aria-hidden="true"
          >
            <div className="itinerary-time-column-time">
              {legTimeStr(props.leg.start)}
            </div>
          </div>
          <ItineraryCircleLine
            index={index}
            modeClassName="walk"
            appendClass="taxi"
          />
          <div
            className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${lowerCaseLegMode}`}
          >
            <div className={cx('itinerary-leg-first-row', 'walk', 'first')}>
              <div className="address-container">
                <div className="address">
                  {address}
                  {leg.from.stop && (
                    <Icon
                      img="icon-icon_arrow-collapse--right"
                      className="itinerary-arrow-icon"
                      color={config.colors.primary}
                    />
                  )}
                </div>
                <div className="place">{place}</div>
              </div>
            </div>
            <div className="divider" />
          </div>
        </div>
      )}

      <div key={props.index} className="row itinerary-row">
        <span className="sr-only">
          <FormattedMessage
            id="itinerary-details.car-leg"
            values={{
              time: legTimeStr(props.leg.start),
              distance,
              to: legDestination(intl, props.leg),
              origin: props.leg.from ? props.leg.from.name : '',
              destination: props.leg.to ? props.leg.to.name : '',
              duration,
            }}
          />
        </span>
        <div
          className="small-2 columns itinerary-time-column"
          aria-hidden="true"
        >
          <div className="itinerary-time-column-time">
            {legTimeStr(props.leg.start)}
          </div>
        </div>
        <ItineraryCircleLineWithIcon
          index={props.index}
          modeClassName={modeClassName}
          taxi
          style={style}
          isNotFirstLeg
        />
        <div
          className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${lowerCaseLegMode}`}
        >
          <div className={`itinerary-leg-first-row ${firstLegClassName}`}>
            <div className="itinerary-leg-row-with-link">{legDescription}</div>
            <ItineraryMapAction
              target={props.leg.from.name || ''}
              focusAction={props.focusAction}
            />
          </div>
          <TaxiLinkContainer
            operatorName={props.leg.route.agency.name}
            infoUrl={infoUrl}
            bookingUrl={bookingUrl}
            icon="icon-icon_taxi-external"
          />
          {alternativeOperators &&
            alternativeOperators.map(operator => {
              return (
                <TaxiLinkContainer
                  key={operator.name}
                  operatorName={operator.name}
                  infoUrl={infoUrl}
                  bookingUrl={bookingUrl}
                  icon="icon-icon_taxi-external"
                />
              );
            })}
          <div className="itinerary-leg-action">
            <div className="itinerary-leg-action-content">
              <FormattedMessage
                id="taxi-distance-duration"
                values={{ distance, duration }}
                defaultMessage="Travel for {distance} ({duration})}"
              />
              <ItineraryMapAction
                target={props.leg.from.name || ''}
                focusAction={props.focusToLeg}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

TaxiLeg.propTypes = {
  leg: legShape.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  focusToLeg: PropTypes.func.isRequired,
};

TaxiLeg.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};
