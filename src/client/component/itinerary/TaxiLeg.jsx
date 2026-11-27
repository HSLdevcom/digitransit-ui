import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import cx from 'classnames';
import { legShape } from '../../utils/shapes';
import ShowOnMapButton from './ShowOnMapButton';
import { useConfigContext } from '../../hooks/ConfigContext';
import LegCircleLineWithIcon from './LegCircleLineWithIcon';
import { legSummaryValues, legPlaceAddress } from '../../utils/legUtils';
import TaxiLinkContainer from './TaxiLinkContainer';
import LegCircleLine from './LegCircleLine';
import LegTimeColumn from './LegTimeColumn';
import LegArrowIcon from './LegArrowIcon';
import AddressPlace from './AddressPlace';

export default function TaxiLeg(props) {
  const intl = useIntl();
  const config = useConfigContext();
  const { leg, index } = props;
  const alternativeOperators = [
    // for testing only
  ];

  const addedPixels = alternativeOperators.length * (41 + 8); // 41px is the height of the TaxiLinkContainer and 8px is the margin
  const topBottomRatio = 0.6; // The ratio of the top and bottom portions of the vertical leg line
  const style = {
    '--taxi-leg-line-top': addedPixels ? `${addedPixels * topBottomRatio}px` : '0px',
    '--taxi-leg-line-bottom': addedPixels ? `${addedPixels * (1 - topBottomRatio)}px` : '0px',
  };

  const values = legSummaryValues(intl, config, props.leg);
  const { time, distance, duration } = values;
  const firstLegClassName = props.index === 0 ? 'first' : '';
  const lowerCaseLegMode = props.leg.mode.toLowerCase();
  const modeClassName = 'taxi-external';

  const legDescription = (
    <span className={cx('leg-header')}>
      <FormattedMessage id="book-a-lift" defaultMessage="Use an app to book a taxi" />
    </span>
  );

  const [address, place] = legPlaceAddress(intl, props.leg);
  const { bookingUrl, infoUrl } = props.leg.pickupBookingInfo?.contactInfo ?? {};
  return (
    <>
      {index === 0 && (
        <div className="row itinerary-row">
          <LegTimeColumn time={time} />
          <LegCircleLine
            index={index}
            modeClassName="walk"
            appendClass="taxi"
            viaType={props.leg.from.viaLocationType}
          />
          <div
            className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${lowerCaseLegMode}`}
          >
            <div className={cx('itinerary-leg-first-row', 'walk', 'first')}>
              <AddressPlace address={address} place={place}>
                {leg.from.stop && <LegArrowIcon />}
              </AddressPlace>
            </div>
            <div className="divider" />
          </div>
        </div>
      )}

      <div className="row itinerary-row">
        <span className="sr-only">
          <FormattedMessage id="itinerary-details.taxi-leg" values={values} />
        </span>
        <LegTimeColumn time={time} />
        <LegCircleLineWithIcon
          index={props.index}
          modeClassName={modeClassName}
          taxi
          style={style}
          isNotFirstLeg
          viaType={props.leg.from.viaLocationType}
        />
        <div
          className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${lowerCaseLegMode}`}
        >
          <div className={`itinerary-leg-first-row ${firstLegClassName}`}>
            <div className="itinerary-leg-row-with-link">{legDescription}</div>
            <ShowOnMapButton target={props.leg.from.name || ''} focusAction={props.focusAction} />
          </div>
          <TaxiLinkContainer
            operatorName={props.leg.route.agency.name}
            infoUrl={infoUrl}
            bookingUrl={bookingUrl}
            icon={config.flex.taxiExternalIcon}
          />
          {alternativeOperators &&
            alternativeOperators.map(operator => {
              return (
                <TaxiLinkContainer
                  key={operator.name}
                  operatorName={operator.name}
                  infoUrl={infoUrl}
                  bookingUrl={bookingUrl}
                  icon={config.flex.taxiExternalIcon}
                />
              );
            })}
          <div className="itinerary-leg-action">
            <div className="itinerary-leg-action-content">
              <FormattedMessage
                id="taxi-distance-duration"
                values={{ distance, duration }}
                defaultMessage="Travel for {distance} ({duration})"
              />
              <ShowOnMapButton target={props.leg.from.name || ''} focusAction={props.focusToLeg} />
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
