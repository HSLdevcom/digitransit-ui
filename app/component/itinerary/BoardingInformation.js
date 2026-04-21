import React from 'react';
import cx from 'classnames';
import PlatformNumber from '../PlatformNumber';
import {
  getTrackOrPierOrPlatformChangeText,
  getTrackOrPierOrPlatformWithNumText,
} from '../../util/modeUtils';
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

/**
 * Returns a string with platform/track information for a transit leg, for screen reader use.
 * @param {Object} leg - The transit leg object.
 * @param {Object} intl - The intl object for formatting messages.
 * @returns {string} The boarding information text.
 */
function getBoardingInformationText(leg, intl, showPlatformChangeLabel = true) {
  if (!leg) {
    return '';
  }
  const platformCode = leg?.from?.stop?.platformCode;
  if (platformCode) {
    const platformChangeLabelText =
      showPlatformChangeLabel && isPlatformChanged(leg)
        ? `${getTrackOrPierOrPlatformChangeText(intl, leg.mode)}:`
        : '';
    const platformLabel = getTrackOrPierOrPlatformWithNumText(
      intl,
      leg.mode,
      platformCode,
    );

    return `${platformChangeLabelText} ${platformLabel}`;
  }
  return '';
}

export { getBoardingInformationText };
export default BoardingInformation;
