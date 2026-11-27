import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMatch } from 'found';
import { stopShape } from '../../utils/shapes';
import Icon from '../Icon';
import ShowOnMapButton from './ShowOnMapButton';
import { parseLocation } from '../../../shared/utils/path';
import { timeStr } from '../../utils/timeUtils';
import { getValidatedLegName } from '../../utils/legUtils';
import LegTimeColumn from './LegTimeColumn';
import AddressPlace from './AddressPlace';

export default function EndLeg(props) {
  const match = useMatch();
  const intl = useIntl();
  const parsedAddress = parseLocation(match.params.to).address;
  const [address, place] = getValidatedLegName(props.to.name, intl, false).split(/, (.+)/);
  // Below check is needed for unit tests
  const [addressFromUrl, placeFromUrl] = !parsedAddress
    ? [address, place]
    : parsedAddress.split(/, (.+)/);
  const { stop } = props.to;
  const modeClassName = 'end';
  const time = timeStr(props.endTime);

  return (
    <div className="row itinerary-row">
      <span className="sr-only">
        <FormattedMessage
          id="itinerary-details.end-leg"
          values={{ time, destination: props.to.name }}
        />
      </span>
      <LegTimeColumn time={time} />
      <div className={`leg-before ${modeClassName}`} aria-hidden="true">
        <div className={`leg-before-circle circle ${modeClassName}`} />
        <div className="itinerary-icon-container">
          <Icon img="icon_mapMarker" className="itinerary-icon to to-it" />
        </div>
      </div>
      <div className="small-9 columns itinerary-instruction-column to end">
        <div className="itinerary-leg-first-row">
          <AddressPlace address={!stop ? address : addressFromUrl} place={place || placeFromUrl} />
          <ShowOnMapButton target={props.to.name} focusAction={props.focusAction} />
        </div>
      </div>
    </div>
  );
}

EndLeg.propTypes = {
  endTime: PropTypes.string.isRequired,
  to: stopShape.isRequired,
  focusAction: PropTypes.func.isRequired,
};
