import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import cx from 'classnames';
import { legShape } from '../../../utils/client/shapes';
import Icon from '../Icon';
import ItineraryMapAction from './ItineraryMapAction';
import { displayDistance } from '../../../utils/shared/geo-utils';
import { durationToString } from '../../../utils/client/timeUtils';
import ItineraryCircleLineWithIcon from './ItineraryCircleLineWithIcon';
import { legTimeStr, legDestination } from '../../../utils/client/legUtils';
import ItineraryCircleLineLong from './ItineraryCircleLineLong';
import { splitStringToAddressAndPlace } from '../../../utils/shared/otpStrings';
import { useConfigContext } from '../../client/ConfigContext';

export default function CarLeg({
  leg,
  index,
  focusAction,
  focusToLeg,
  children,
  carBoardingLeg,
}) {
  const intl = useIntl();
  const config = useConfigContext();
  const distance = displayDistance(
    parseInt(leg.distance, 10),
    config,
    intl.formatNumber,
  );
  const duration = durationToString(intl, leg.duration * 1000);
  const firstLegClassName = index === 0 ? 'first' : '';
  const modeClassName = 'car';

  const circleLine = carBoardingLeg ? (
    <ItineraryCircleLineLong
      index={index}
      modeClassName={modeClassName}
      boardingLeg={carBoardingLeg}
      viaType={leg.from.viaLocationType}
    />
  ) : (
    <ItineraryCircleLineWithIcon
      index={index}
      modeClassName={modeClassName}
      icon="icon_car"
      viaType={leg.from.viaLocationType}
    />
  );

  const [name, place] = splitStringToAddressAndPlace(leg.from.name);
  const address =
    leg.from.viaLocationType && leg.viaAddress ? leg.viaAddress : name;

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return (
    <div key={index} className="row itinerary-row">
      <span className="sr-only">
        <FormattedMessage
          id="itinerary-details.car-leg"
          values={{
            time: legTimeStr(leg.start),
            distance,
            to: legDestination(intl, leg),
            origin: leg.from ? leg.from.name : '',
            destination: leg.to ? leg.to.name : '',
            duration,
          }}
        />
      </span>
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">
          {legTimeStr(leg.start)}
        </div>
      </div>
      {circleLine}
      <div
        className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${leg.mode.toLowerCase()}`}
      >
        <div className={`itinerary-leg-first-row ${firstLegClassName}`}>
          <div className="address-container">
            <div className="address">
              {address}
              {leg.isViaPoint && (
                <Icon
                  img="icon_mapMarker"
                  className="itinerary-mapmarker-icon"
                />
              )}
              {leg.from.stop && (
                <Icon
                  img="icon_arrow-collapse--right"
                  className="itinerary-arrow-icon"
                  color="#333"
                />
              )}
            </div>
            <div className="place">{place}</div>
          </div>
          <div>{children}</div>
          <ItineraryMapAction
            target={leg.from.name || ''}
            focusAction={focusAction}
          />
        </div>
        {carBoardingLeg?.from.stop && (
          <div
            className={cx(
              'itinerary-leg-action',
              'car',
              'itinerary-leg-action-content',
            )}
          >
            <FormattedMessage
              id="car-drive-from-transit-no-duration"
              values={{
                transportMode: (
                  <FormattedMessage
                    id={`from-${carBoardingLeg.from.stop.vehicleMode.toLowerCase()}`}
                  />
                ),
              }}
            />
            <ItineraryMapAction
              target={leg.from.name || ''}
              focusAction={focusAction}
            />
          </div>
        )}
        <div className="itinerary-leg-action itinerary-leg-action-content">
          <FormattedMessage
            id={
              config.hideCarSuggestionDuration
                ? 'car-distance-no-duration'
                : 'car-distance-duration'
            }
            values={{ distance, duration }}
            defaultMessage="Drive {distance} ({duration})}"
          />
          <ItineraryMapAction
            target={leg.from.name || ''}
            focusAction={focusToLeg}
          />
        </div>
        {carBoardingLeg?.to.stop && (
          <div
            className={cx(
              'itinerary-leg-action',
              'car',
              'itinerary-leg-action-content',
            )}
          >
            <FormattedMessage
              id="car-drive-to-transit-no-duration"
              values={{
                transportMode: (
                  <FormattedMessage
                    id={`to-${carBoardingLeg.to.stop?.vehicleMode.toLowerCase()}`}
                  />
                ),
              }}
            />
            <ItineraryMapAction
              target={leg.from.name || ''}
              focusAction={focusAction}
            />
          </div>
        )}
      </div>
    </div>
  );
}

CarLeg.propTypes = {
  leg: legShape.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  children: PropTypes.node,
  carBoardingLeg: legShape,
};
