import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import { useTranslationsContext } from '../util/useTranslationsContext';
import { useConfigContext } from '../configurations/ConfigContext';

/**
 * A generic snackbar notification.
 * The caller is responsible for managing the `show` state transitions and
 * for providing a `liveRegionMessage` for screen-reader announcements.
 */
const Snackbar = ({
  show,
  messageId,
  defaultMessage,
  liveRegionMessage,
  onClose,
  iconImg,
  className,
}) => {
  const intl = useTranslationsContext();
  const config = useConfigContext();
  return (
    <>
      <div
        className={cx('snackbar', className, {
          hide: show === null,
          show: show === true,
          'slide-out': show === false,
        })}
        aria-hidden="true"
      >
        <Icon img={iconImg} />
        <span className="snackbar-text">
          <FormattedMessage id={messageId} defaultMessage={defaultMessage} />
        </span>
        <button
          type="button"
          className="close-button"
          aria-label={intl.formatMessage({
            id: 'close',
            defaultMessage: 'Close notification',
          })}
          onClick={onClose}
          tabIndex="-1"
        >
          <Icon
            id="close-icon"
            img="notification-close"
            color={config.colors.primary}
          />
        </button>
      </div>
      <div className="sr-only" aria-live="polite" role="status">
        {liveRegionMessage}
      </div>
    </>
  );
};

Snackbar.propTypes = {
  /** null = hidden, true = slide in, false = slide out */
  show: PropTypes.oneOf([null, true, false]),
  messageId: PropTypes.string.isRequired,
  defaultMessage: PropTypes.string.isRequired,
  liveRegionMessage: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  iconImg: PropTypes.string,
  className: PropTypes.string,
};

Snackbar.defaultProps = {
  show: null,
  liveRegionMessage: '',
  iconImg: 'icon_checkmark-circled',
  className: undefined,
};

export default Snackbar;
