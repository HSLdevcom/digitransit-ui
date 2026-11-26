import cx from 'classnames';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { itineraryShape } from '../../utils/shapes';
import { useConfigContext } from '../../hooks/ConfigContext';
import { displayDistance } from '../../../shared/utils/geo-utils';
import { getTotalDistance } from '../../utils/legUtils';
import { addAnalyticsEvent } from '../../../shared/utils/analyticsUtils';
import SecondaryButton from '../SecondaryButton';

const printItinerary = e => {
  e.stopPropagation();
  addAnalyticsEvent({
    event: 'sendMatomoEvent',
    category: 'Itinerary',
    action: 'Print',
    name: null,
  });
  window.print();
};

export default function ItineraryTotals({ itinerary, small = false }) {
  const intl = useIntl();
  const config = useConfigContext();
  return (
    <div className={cx('itinerary-profile-container', { small })}>
      <div className="itinerary-profile-item">
        <div className="itinerary-profile-item-title">
          {`${intl.formatMessage({ id: 'distance-total', defaultMessage: 'Distance' })}:`}
        </div>
        <div className="itinerary-profile-item-value">
          {displayDistance(getTotalDistance(itinerary), config, intl.formatNumber)}
        </div>
      </div>
      {printItinerary && (
        <SecondaryButton
          ariaLabel="print"
          buttonName="print"
          buttonClickAction={printItinerary}
          buttonIcon="icon_print"
          smallSize
        />
      )}
    </div>
  );
}

ItineraryTotals.propTypes = { itinerary: itineraryShape.isRequired, small: PropTypes.bool };
