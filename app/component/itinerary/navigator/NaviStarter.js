import Button from '@hsl-fi/button';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { configShape } from '../../../util/shapes';
import Icon from '../../Icon';
import { useLogo } from './hooks/useLogo';

const NaviStarter = ({ time, startItinerary }, { config, intl }) => {
  const { logo } = useLogo(config.trafficLightGraphic);

  const handleClick = () => startItinerary(Date.now());

  return (
    <div className="navi-initializer-container">
      <div className="navi-initializer-card">
        {logo ? (
          <img src={logo} alt="navigator logo" />
        ) : (
          <Icon img="icon-icon_navigation_wait" className="mode" />
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
};

NaviStarter.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
};

export default NaviStarter;
