import PropTypes from 'prop-types';
import React from 'react';

import BackButton from './BackButton';
import DisruptionInfo from './DisruptionInfo';
import MainMenuContainer from './MainMenuContainer';
import ComponentUsageExample from './ComponentUsageExample';
import MessageBar from './MessageBar';
import { isBrowser } from '../util/browser';

const AppBarSmall = (
  { disableBackButton, showLogo, title, homeUrl, logo },
  { config },
) => (
  <React.Fragment>
    <DisruptionInfo />
    <nav className="top-bar">
      {!disableBackButton && <BackButton />}
      <section className="title">
        {isBrowser && showLogo && !config.textLogo ? (
          <div className="logo" style={ backgroundImage = `url(${logo})`} />
        ) : (
          <span className="title">{title}</span>
        )}
      </section>
      <MainMenuContainer homeUrl={homeUrl} />
    </nav>
    <MessageBar />
  </React.Fragment>
);

AppBarSmall.displayName = 'AppBarSmall';

AppBarSmall.description = () => (
  <div>
    <p>AppBar of application for small display</p>
    <ComponentUsageExample description="">
      <AppBarSmall title="Reittiopas.fi" className="fullscreen" />
    </ComponentUsageExample>
    <ComponentUsageExample description="no back button">
      <AppBarSmall
        disableBackButton
        title="Reittiopas.fi"
        className="fullscreen"
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="Show logo">
      <AppBarSmall
        showLogo
        disableBackButton
        title="Reittiopas.fi"
        className="fullscreen"
      />
    </ComponentUsageExample>
  </div>
);

AppBarSmall.propTypes = {
  disableBackButton: PropTypes.bool,
  title: PropTypes.node,
  showLogo: PropTypes.bool,
  homeUrl: PropTypes.string,
  logo: PropTypes.string,
};

AppBarSmall.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default AppBarSmall;
