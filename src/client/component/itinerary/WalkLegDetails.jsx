import cx from 'classnames';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useConfigContext } from '../../hooks/ConfigContext';
import ShowOnMapButton from './ShowOnMapButton';
import SubwayEntranceInfo from './SubwayEntranceInfo';

/** Gray rows of a walk leg: the walk distance and duration, and the subway exit and entrance. */
export default function WalkLegDetails({
  distance,
  duration,
  showWalkInfo,
  showSubwayExit,
  showSubwayEntrance,
  entranceName,
  entranceAccessible,
  focusToLeg,
}) {
  const { emphasizeDistance } = useConfigContext();

  return (
    <div className="itinerary-leg-action">
      {showSubwayExit && (
        <SubwayEntranceInfo
          type="exit"
          entranceName={entranceName}
          entranceAccessible={entranceAccessible}
        />
      )}
      {showWalkInfo && (
        <div
          className={cx('itinerary-leg-action-content', {
            'subway-entrance-info': showSubwayExit || showSubwayEntrance,
          })}
        >
          <FormattedMessage
            id="walk-distance-duration"
            values={{ distance: emphasizeDistance ? <b>{distance}</b> : distance, duration }}
          />
          <ShowOnMapButton
            target=""
            ariaLabelId="itinerary-list-row.clickable-area-description"
            focusAction={focusToLeg}
          />
        </div>
      )}
      {showSubwayEntrance && (
        <SubwayEntranceInfo
          type="entrance"
          entranceName={entranceName}
          entranceAccessible={entranceAccessible}
        />
      )}
    </div>
  );
}

WalkLegDetails.propTypes = {
  distance: PropTypes.string.isRequired,
  duration: PropTypes.string.isRequired,
  showWalkInfo: PropTypes.bool.isRequired,
  showSubwayExit: PropTypes.bool.isRequired,
  showSubwayEntrance: PropTypes.bool.isRequired,
  entranceName: PropTypes.string,
  entranceAccessible: SubwayEntranceInfo.propTypes.entranceAccessible,
  focusToLeg: PropTypes.func.isRequired,
};
