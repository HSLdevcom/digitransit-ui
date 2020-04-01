import PropTypes from 'prop-types';
import React from 'react';

import BackButton from './BackButton';
import DisruptionInfo from './DisruptionInfo';
import MainMenuContainer from './MainMenuContainer';
import ComponentUsageExample from './ComponentUsageExample';
import MessageBar from './MessageBar';
import LogoSmall from './LogoSmall';
import CanceledLegsBar from './CanceledLegsBar';

const AppBarSmall = ({
  disableBackButton,
  showLogo,
  title,
  homeUrl,
  logo,
  user,
}) => (
  <React.Fragment>
    <DisruptionInfo />
    <nav className="top-bar">
      {!disableBackButton && <BackButton />}
      <section className="title">
        <LogoSmall showLogo={showLogo} logo={logo} title={title} />
      </section>
      <MainMenuContainer homeUrl={homeUrl} user={user} />
    </nav>
    <MessageBar />
    <CanceledLegsBar />
  </React.Fragment>
);

AppBarSmall.displayName = 'AppBarSmall';

AppBarSmall.description = () => (
  <div>
    <p>AppBar of application for small display</p>
    <ComponentUsageExample description="">
      <AppBarSmall title="Reittiopas.hsl.fi" className="fullscreen" />
    </ComponentUsageExample>
    <ComponentUsageExample description="no back button">
      <AppBarSmall
        disableBackButton
        title="Reittiopas.hsl.fi"
        className="fullscreen"
      />
    </ComponentUsageExample>
  </div>
);

AppBarSmall.propTypes = {
  disableBackButton: PropTypes.bool,
  showLogo: PropTypes.bool,
  title: PropTypes.node,
  homeUrl: PropTypes.string,
  logo: PropTypes.string,
  user: PropTypes.object,
};

export default AppBarSmall;
