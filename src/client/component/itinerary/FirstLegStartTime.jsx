import cx from 'classnames';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { legTimeStr } from '../../utils/legUtils';
import { getFirstDepartureStopTypeText, getFirstDepartureMessageId } from '../../utils/localeUtils';
import Icon from '../Icon';
import BoardingInformation from './BoardingInformation';
import { legShape } from '../../utils/shapes';

export default function FirstLegStartTime({
  firstDeparture,
  hasCallAgencyLeg,
  breakpoint,
  stopNames,
}) {
  const intl = useIntl();
  const small = breakpoint !== 'large';

  let content;
  if (hasCallAgencyLeg) {
    content = (
      <>
        <Icon img="icon_alert-circle" className="itinerary-summary-icon" omitViewBox />
        <FormattedMessage id="itinerary-row.call-agency-description" />
      </>
    );
  } else if (firstDeparture) {
    content = (
      <FormattedMessage
        id={getFirstDepartureMessageId(firstDeparture, false)}
        values={{
          firstDepartureTime: (
            <span className={cx('start-time', { realtime: firstDeparture.realTime })}>
              {legTimeStr(firstDeparture.start)}
            </span>
          ),
          firstDepartureStopType: getFirstDepartureStopTypeText(intl, firstDeparture.mode),
          // In case the first leg is a scooter leg, stopNames[0] is an empty string.
          firstDepartureStop: stopNames[0] || stopNames[1],
          firstDeparturePlatform: <BoardingInformation leg={firstDeparture} />,
        }}
      />
    );
  } else {
    content = <FormattedMessage id="itinerary-row.no-transit-legs" />;
  }

  return (
    <div className={cx('itinerary-first-leg-start-time', { small })} aria-hidden="true">
      {content}
    </div>
  );
}

FirstLegStartTime.propTypes = {
  firstDeparture: legShape,
  hasCallAgencyLeg: PropTypes.bool.isRequired,
  breakpoint: PropTypes.string.isRequired,
  stopNames: PropTypes.arrayOf(PropTypes.string).isRequired,
};
