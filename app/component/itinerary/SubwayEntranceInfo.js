import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Icon from '../Icon';

export default function SubwayEntranceInfo({
  type, // exit / entrance
  entranceName,
  entranceAccessible,
}) {
  return (
    <div
      className="subway-entrance-info-container"
      aria-labelledby="subway-entrance-label"
    >
      <span id="subway-entrance-label" className="sr-only">
        <FormattedMessage
          id={
            entranceAccessible === 'POSSIBLE'
              ? `subway-${type}.sr-description.accessible`
              : `subway-${type}.sr-description`
          }
          defaultMessage={`${type} ${entranceName}`}
          values={{ entranceName }}
        />
      </span>

      <div className="subway-entrance-info-text" aria-hidden="true">
        <FormattedMessage id={`station-${type}`} defaultMessage={type} />
      </div>
      <Icon img="icon_subway_entrance" className="subway-entrance-info-icon" />
      {entranceName && (
        <Icon
          className="subway-entrance-info-icon"
          img={`icon_subway_entrance_${entranceName.toLowerCase()}`}
        />
      )}
      {entranceAccessible === 'POSSIBLE' && (
        <Icon
          className="subway-entrance-info-icon"
          img="icon_wheelchair_filled"
        />
      )}
    </div>
  );
}
SubwayEntranceInfo.propTypes = {
  type: PropTypes.string.isRequired,
  entranceName: PropTypes.string,
  entranceAccessible: PropTypes.string,
};

SubwayEntranceInfo.defaultProps = {
  entranceName: '',
  entranceAccessible: undefined,
};
