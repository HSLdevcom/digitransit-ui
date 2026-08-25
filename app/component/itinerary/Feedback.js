import PropTypes from 'prop-types';
import cx from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useRouter } from 'found';
import { Text } from '@hsl-fi/layout-primitives';
import { ArrowLink } from '@hsl-fi/navigation';
import Icon from '../Icon';
import { useConfigContext } from '../../configurations/ConfigContext';
import { getLoginPath } from '../../util/path';

const ANIMATION_MS = 1200;

function FeedbackLayer({ recommended, status, giveFeedback, animationClass }) {
  const config = useConfigContext();
  const { colors } = config;
  const intl = useIntl();
  const { match } = useRouter();

  const favIcon = recommended
    ? 'icon_star-with-circle'
    : 'icon_star-unselected';
  const iconMap = {
    'personalization-ask': {
      img: favIcon,
      className: cx('favourite', { selected: recommended }),
      fill: recommended ? '#c53291' : '#FFF',
      width: 1.7245,
      height: 1.7245,
    },
    'personalization-liked': {
      img: 'icon_thumb',
      color: colors.primary,
      width: 1.4,
      height: 1.4,
    },
    'personalization-disliked': {
      img: 'icon_thumb-down',
      color: colors.primary,
      width: 1.4,
      height: 1.4,
    },
  };
  const iconProps = iconMap[status];
  const loginNeeded = config.allowLogin && !config.user.sub;
  const thumbColor = loginNeeded ? '#CCC' : colors.primary;
  const statusStyle =
    status === 'personalization-ask' ? 'routes-s-bold' : 'text-xs';
  const statusText = (
    <Text variant={statusStyle}>{intl.formatMessage({ id: status })}</Text>
  );

  const middleTexts = loginNeeded ? (
    <div>
      {statusText}
      <ArrowLink href={getLoginPath(match.location)}>
        <Text variant="routes-s-bold">
          {intl.formatMessage({ id: 'personalization-login-for-voting' })}
        </Text>
      </ArrowLink>
    </div>
  ) : (
    statusText
  );

  return (
    <div className={cx('feedback-layer', animationClass)}>
      <div className="feedback-container">
        <div
          className={cx('feedback-section', {
            'feedback-section-centered': !loginNeeded,
            'feedback-text-posted': status !== 'personalization-ask',
          })}
        >
          <Icon {...iconProps} />
          <span>&nbsp;&nbsp;&nbsp;</span>
          {middleTexts}
        </div>
        {status === 'personalization-ask' && (
          <div className="feedback-section">
            <button
              type="button"
              className={cx('thumb-button', {
                'thumb-button-disabled': loginNeeded,
              })}
              onClick={() => giveFeedback(true)}
              aria-label={intl.formatMessage({
                id: 'personalization-aria-like',
              })}
            >
              <Icon img="icon_thumb" color={thumbColor} height={1} width={1} />
            </button>
            <button
              type="button"
              className={cx('thumb-button', {
                'thumb-button-disabled': loginNeeded,
              })}
              onClick={() => giveFeedback(false)}
              aria-label={intl.formatMessage({
                id: 'personalization-aria-dislike',
              })}
            >
              <Icon
                img="icon_thumb-down"
                color={thumbColor}
                height={1}
                width={1}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

FeedbackLayer.propTypes = {
  recommended: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
  giveFeedback: PropTypes.func.isRequired,
  animationClass: PropTypes.string.isRequired,
};

export default function Feedback({
  recommended, // true if ranked as best by personalization algo
  feedback, // true=likes, false=dislikes, undefined=no feedback yet
  giveFeedback, // callback to submit user's feedback action
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleGiveFeedback = value => {
    if (!giveFeedback || isAnimating) {
      return;
    }

    setIsAnimating(true);
    timerRef.current = setTimeout(() => {
      setIsAnimating(false);
      panelRef.current?.focus();
    }, ANIMATION_MS);
    giveFeedback(value);
  };

  let status;
  if (feedback === true) {
    status = 'personalization-liked';
  } else if (feedback === false) {
    status = 'personalization-disliked';
  } else {
    status = 'personalization-ask';
  }

  return (
    <div ref={panelRef} className="feedback-panel" tabIndex="-1">
      {(status !== 'personalization-ask' || isAnimating) && (
        <FeedbackLayer
          key="knownstate"
          recommended={recommended}
          status={status}
          giveFeedback={handleGiveFeedback}
          animationClass={isAnimating ? 'enter' : ''}
        />
      )}
      {(status === 'personalization-ask' || isAnimating) && (
        <FeedbackLayer
          key="askstate"
          recommended={recommended}
          status="personalization-ask"
          giveFeedback={handleGiveFeedback}
          animationClass={isAnimating ? 'leave' : ''}
        />
      )}
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        <FormattedMessage id={status} />
      </div>
    </div>
  );
}

Feedback.propTypes = {
  recommended: PropTypes.bool,
  feedback: PropTypes.bool,
  giveFeedback: PropTypes.func,
};
