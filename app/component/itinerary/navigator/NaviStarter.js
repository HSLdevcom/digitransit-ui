import Button from '@hsl-fi/button';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { configShape } from '../../../util/shapes';
import Icon from '../../Icon';
import { useLogo } from './hooks/useLogo';

const NaviStarter = (
  { time, startItinerary, containerTopPosition, isPastStart },
  { config, intl },
) => {
  const { logo } = useLogo(config.trafficLightGraphic);
  const [isVisible, setIsVisible] = useState(!isPastStart);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setIsDismissed(isPastStart);
  }, [isPastStart]);

  const handleClick = () => {
    addAnalyticsEvent({
      category: 'Itinerary',
      event: 'navigator',
      action: 'start_navigation_manual',
    });
    setIsDismissed(true);
  };

  const handleAnimationEnd = () => {
    setIsVisible(false);
    startItinerary(Date.now());
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`navi-initializer-container ${isDismissed && 'slide-out'}`}
      onAnimationEnd={handleAnimationEnd}
      style={{ top: containerTopPosition }}
    >
      <div className="navi-initializer-card">
        {logo ? (
          <img src={logo} alt="navigator logo" />
        ) : (
          <Icon
            img="icon-icon_navigation_wait"
            className="mode"
            height={2}
            width={2}
          />
        )}
        <FormattedMessage id="navigation-journey-start" />
        <h3>{time}</h3>
      </div>
      <div className="navi-initializer-card success">
        <FormattedMessage id="navigation-journey-start-early-prompt" />
        <Button
          size="small"
          value={intl.formatMessage({ id: 'navigation-intro-begin' })}
          onClick={handleClick}
        />
      </div>
    </div>
  );
};

NaviStarter.propTypes = {
  time: PropTypes.string.isRequired,
  startItinerary: PropTypes.func.isRequired,
  containerTopPosition: PropTypes.number,
  isPastStart: PropTypes.bool,
};

NaviStarter.defaultProps = {
  containerTopPosition: 0,
  isPastStart: true,
};

NaviStarter.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
};

export default NaviStarter;
