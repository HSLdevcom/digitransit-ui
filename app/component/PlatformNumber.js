import PropTypes from 'prop-types';
import React from 'react';
import { useIntl } from 'react-intl';
import cx from 'classnames';
import Icon from './Icon';
import {
  getTrackOrPierOrPlatformText,
  getTrackOrPierOrPlatformTextShort,
} from '../util/modeUtils';

function PlatformNumber({ number, short, mode, updated, withText, plain }) {
  const intl = useIntl();
  if (!number) {
    return false;
  }

  const platformUpdateIcon = (
    <Icon className="platform-updated-icon" img="icon_arrow-right-long" />
  );

  if (short) {
    return (
      <span className="platform-short">
        {withText &&
          mode &&
          getTrackOrPierOrPlatformTextShort(intl, mode.toUpperCase())}
        <span
          className={cx('platform-number-wrapper', {
            'platform-updated': updated,
          })}
        >
          {updated && platformUpdateIcon}
          {number}
        </span>
      </span>
    );
  }

  return (
    <span className={plain ? 'platform-number-plain' : 'platform-number'}>
      {withText &&
        mode &&
        getTrackOrPierOrPlatformText(intl, mode.toUpperCase())}
      <span
        className={cx('platform-number-wrapper', {
          'platform-updated': updated,
        })}
      >
        {updated && platformUpdateIcon}
        {number}
      </span>
    </span>
  );
}

PlatformNumber.propTypes = {
  number: PropTypes.string,
  short: PropTypes.bool,
  mode: PropTypes.string.isRequired,
  updated: PropTypes.bool,
  withText: PropTypes.bool,
  plain: PropTypes.bool,
};

PlatformNumber.defaultProps = {
  number: undefined,
  short: true,
  updated: false,
  withText: true,
  plain: false,
};

PlatformNumber.displayName = 'PlatformNumber';

export default PlatformNumber;
