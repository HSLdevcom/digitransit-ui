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
import LegAction from './LegAction';

export default function TaxiLeg({ leg, index, focusAction, focusToLeg }) {
  const intl = useIntl();
  const config = useConfigContext();
  const alternativeOperators = [
    // for testing only
  ];

  const addedPixels = alternativeOperators.length * (41 + 8); // 41px is the height of the TaxiLinkContainer and 8px is the margin
  const topBottomRatio = 0.6; // The ratio of the top and bottom portions of the vertical leg line
  const style = {
    '--taxi-leg-line-top': addedPixels ? `${addedPixels * topBottomRatio}px` : '0px',
    '--taxi-leg-line-bottom': addedPixels ? `${addedPixels * (1 - topBottomRatio)}px` : '0px',
  };

  const values = legSummaryValues(intl, config, leg);
  const { time, distance, duration } = values;
  const firstLegClassName = index === 0 ? 'first' : '';
  const lowerCaseLegMode = leg.mode.toLowerCase();
  const modeClassName = 'taxi-external';

  const legDescription = (
    <span className={cx('leg-header')}>
      <FormattedMessage id="book-a-lift" />
    </span>
  );

  const [address, place] = legPlaceAddress(intl, leg);
  const { bookingUrl, infoUrl } = leg.pickupBookingInfo?.contactInfo ?? {};
  return (
    <>
      {index === 0 && (
        <div className="row itinerary-row">
          <LegTimeColumn time={time} />
          <LegCircleLine
            index={index}
            modeClassName="walk"
            appendClass="taxi"
            viaType={leg.from.viaLocationType}
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
          index={index}
          modeClassName={modeClassName}
          taxi
          style={style}
          isNotFirstLeg
          viaType={leg.from.viaLocationType}
        />
        <div
          className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${lowerCaseLegMode}`}
        >
          <div className={`itinerary-leg-first-row ${firstLegClassName}`}>
            <div className="itinerary-leg-row-with-link">{legDescription}</div>
            <ShowOnMapButton target={leg.from.name || ''} focusAction={focusAction} />
          </div>
          <TaxiLinkContainer
            operatorName={leg.route.agency.name}
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
          <LegAction focusAction={focusToLeg} target={leg.from.name}>
            <FormattedMessage id="taxi-distance-duration" values={{ distance, duration }} />
          </LegAction>
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
