import React, { PropTypes } from 'react';

import BackButton from './BackButton';
import NotImplemented from '../util/not-implemented';
import DisruptionInfo from '../disruption/DisruptionInfo';
import MainMenuContainer from './MainMenuContainer';
import MessageBar from './MessageBar';
import ComponentUsageExample from '../documentation/ComponentUsageExample';

const AppBarSmall = ({ disableBackButton, showLogo, title }) =>
  <div>
    <NotImplemented />
    <DisruptionInfo />
    <nav className="top-bar">
      {!disableBackButton && <BackButton />}
      <section className="title">
        {showLogo ?
          <div className="logo" /> :
          <span className="title">{title}</span>
        }
      </section>
      <MainMenuContainer />
    </nav>
    <MessageBar />
  </div>;

AppBarSmall.description = () => (
  <div>
    <p>
      AppBar of application for small display
    </p>
    <ComponentUsageExample description="">
      <AppBarSmall title="Reittiopas.fi" className="fullscreen" />
    </ComponentUsageExample>
    <ComponentUsageExample description="no back button">
      <AppBarSmall disableBackButton title="Reittiopas.fi" className="fullscreen" />
    </ComponentUsageExample>
  </div>);


AppBarSmall.propTypes = {
  disableBackButton: PropTypes.bool,
  title: PropTypes.node.isRequired,
  showLogo: PropTypes.bool,
};

export default AppBarSmall;
