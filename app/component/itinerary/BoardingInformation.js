import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import PlatformNumber from '../PlatformNumber';
import { modeUsesTrack } from '../../util/modeUtils';
import { isPlatformChanged } from '../../util/legUtils';

/**
 * BoardingInformation displays platform or track information for a departure leg.
 * Shows a highlighted number if the platform/track has changed.
 * @param {Object} props - The component props.
 * @param {Object} props.departure - The departure leg object.
 * @return {React.Element|null} The boarding information element or null if no platform code.
 */
function BoardingInformation({ departure }) {
  const platformChanged = isPlatformChanged(departure);
  const platformCode = departure?.from?.stop?.platformCode;
  if (platformCode) {
    const comma = ', ';
    return (
      <span
        className={cx('platform-or-track', {
          'platform-updated': platformChanged,
        })}
      >
        {comma}
        {platformChanged ? (
          <>
            <FormattedMessage
              id={modeUsesTrack(departure.mode) ? 'track' : 'platform'}
            />
            <PlatformNumber
              number={platformCode}
              updated={platformChanged}
              isRailOrSubway={modeUsesTrack(departure.mode)}
              withText={false}
            />
          </>
        ) : (
          <FormattedMessage
            id={modeUsesTrack(departure.mode) ? 'track-num' : 'platform-num'}
            values={{ platformCode }}
          />
        )}
      </span>
    );
  }
  return null;
}

BoardingInformation.propTypes = {
  departure: PropTypes.object.isRequired,
};

/**
 * Returns a message indicating a platform or track change.
 * @param {boolean} isTrack - True if the mode uses track, false for platform.
 * @param {Object} intl - The intl object for formatting messages.
 * @return {string} The platform change label.
 */
function getPlatformChangeLabel(isTrack, intl) {
  return intl.formatMessage({
    id: isTrack ? 'navigation-track-change' : 'navigation-platform-change',
    defaultMessage: isTrack ? 'Track change' : 'Platform change',
  });
}

/**
 * Returns a string with platform/track information for a departure, for screen reader use.
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
    const isTrack = modeUsesTrack(leg.mode);
    const platformChangeLabelText =
      showPlatformChangeLabel && isPlatformChanged(leg)
        ? `${getPlatformChangeLabel(isTrack, intl)}:`
        : '';
    const platformLabel = intl.formatMessage(
      {
        id: isTrack ? 'track-num' : 'platform-num',
      },
      { platformCode },
    );
    return `${platformChangeLabelText} ${platformLabel}`;
  }
  return '';
}

export { getBoardingInformationText, getPlatformChangeLabel };
export default BoardingInformation;
