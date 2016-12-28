import React, { PropTypes } from 'react';

import BackButton from './BackButton';
import DisruptionInfo from './DisruptionInfo';
import MainMenuContainer from './MainMenuContainer';
import ComponentUsageExample from './ComponentUsageExample';

const AppBarSmall = ({ disableBackButton, showLogo, title }) =>
  <div>
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
    <ComponentUsageExample description="Show logo">
      <AppBarSmall showLogo disableBackButton title="Reittiopas.fi" className="fullscreen" />
    </ComponentUsageExample>
  </div>);


AppBarSmall.propTypes = {
  disableBackButton: PropTypes.bool,
  title: PropTypes.node,
  showLogo: PropTypes.bool,
};

export default AppBarSmall;
