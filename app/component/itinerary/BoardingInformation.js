import React from 'react';
import cx from 'classnames';
import PlatformNumber from '../PlatformNumber';
import { isPlatformChanged } from '../../util/legUtils';
import { legShape } from '../../util/shapes';

/**
 * BoardingInformation displays platform or track information for a transit leg.
 * Shows a highlighted number if the platform/track has changed.
 * @param {Object} props - The component props.
 * @param {Object} props.leg - The transit leg object.
 * @return {React.Element|null} The boarding information element or null if no platform code.
 */
function BoardingInformation({ leg }) {
  const platformChanged = isPlatformChanged(leg);
  const platformCode = leg?.from?.stop?.platformCode;
  if (platformCode) {
    const comma = ', ';
    return (
      <span
        className={cx('platform-or-track', {
          'platform-updated': platformChanged,
        })}
      >
        {comma}
        <PlatformNumber
          number={platformCode}
          short={false}
          updated={platformChanged}
          mode={leg.mode}
          withText
          plain
        />
      </span>
    );
  }
  return null;
}

BoardingInformation.propTypes = {
  leg: legShape.isRequired,
};

export default BoardingInformation;
