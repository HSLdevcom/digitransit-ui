import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import { FormattedMessage, useIntl } from 'react-intl';
import Icon from './Icon';
import withBreakpoint from '../util/withBreakpoint';
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
  liveRegionMessage = '',
  onClose,
  iconImg = 'icon_checkmark-circled',
  className,
  breakpoint,
}) => {
  const intl = useIntl();
  const config = useConfigContext();
  const content = (
    <>
      <div
        className={cx('snackbar', className, {
          hide: show === null,
          show: show === true,
          'slide-out': show === false,
          'mobile-snackbar': breakpoint !== 'large',
          'desktop-snackbar': breakpoint === 'large',
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
      {/* .sr-only relies on position: absolute with no top/left, so its
          static-position fallback is used. Portaled directly to
          document.body (after all in-flow app content), that fallback
          places it right at the bottom of the document, 1px below the
          viewport, which creates a spurious scrollbar. Pinning it with an
          inline style (highest CSS priority, so it overrides the shared
          .sr-only rule) keeps it fixed to the viewport instead. */}
      <div
        className="sr-only"
        style={{ position: 'fixed', top: 0, left: 0 }}
        aria-live="polite"
        role="status"
      >
        {liveRegionMessage}
      </div>
    </>
  );

  // Snackbar is portaled directly to document.body so it always escapes
  // ancestor stacking contexts (e.g. the desktop offcanvas settings drawer,
  // which establishes its own stacking context via position:relative +
  // z-index). Without the portal, Snackbar's own z-index of 9999 would only
  // apply *within* that ancestor's stacking context, so it could still be
  // rendered behind unrelated elements (like the header) that live in a
  // higher outer stacking context.
  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(content, document.body)
    : content;
};

Snackbar.propTypes = {
  /** null = hidden, true = slide in, false = slide out */
  show: PropTypes.oneOf([null, true, false]),
  messageId: PropTypes.string.isRequired,
  defaultMessage: PropTypes.string,
  liveRegionMessage: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  iconImg: PropTypes.string,
  className: PropTypes.string,
  breakpoint: PropTypes.string.isRequired,
};

export default withBreakpoint(Snackbar);
