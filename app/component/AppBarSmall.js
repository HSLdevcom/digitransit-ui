import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import { addAnalyticsEvent } from '../util/analyticsUtils';
import DisruptionInfo from './DisruptionInfo';
import MessageBar from './MessageBar';
import LogoSmall from './LogoSmall';
import CanceledLegsBar from './CanceledLegsBar';

const AppBarSmall = (
  { showLogo, logo, breakpoint, titleClicked, map },
  { config, intl },
) => {
  return (
    <div className={`app-bar--small ${map ? 'app-bar--small-with-map' : ''}`}>
      <DisruptionInfo />
      {config.NODE_ENV !== 'test' && <MessageBar breakpoint={breakpoint} />}
      <CanceledLegsBar />
      <nav className={`top-bar ${breakpoint !== 'large' ? 'mobile' : ''}`}>
        <section className="title">
          <button
            aria-label={intl.formatMessage({
              id: 'to-frontpage',
              defaultMessage: 'To frontpage',
            })}
            type="button"
            onClick={e => {
              titleClicked(e);
              addAnalyticsEvent({
                category: 'Navigation',
                action: 'Home',
                name: null,
              });
            }}
          >
            <LogoSmall showLogo={showLogo} logo={logo} />
          </button>
        </section>
      </nav>
    </div>
  );
};

AppBarSmall.displayName = 'AppBarSmall';

AppBarSmall.propTypes = {
  showLogo: PropTypes.bool,
  logo: PropTypes.string,
  breakpoint: PropTypes.string,
  titleClicked: PropTypes.func,
  map: PropTypes.any,
};

AppBarSmall.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default AppBarSmall;
