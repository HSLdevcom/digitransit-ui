import React, { PropTypes } from 'react';
import Tabs from 'material-ui/Tabs/Tabs';
import Tab from 'material-ui/Tabs/Tab';
import config from '../../config';
import NotImplemented from '../util/NotImplemented';
import DisruptionInfo from '../disruption/DisruptionInfo';
import MainMenuContainer from './MainMenuContainer';
import MessageBar from './MessageBar';
import ComponentUsageExample from '../documentation/ComponentUsageExample';

const tabStyle = { height: '60px', textTransform: 'none', fontSize: '17px' };

const NAVI_LINKS = (() => {
  const links = [];

  if (config.topNaviLinks) {
    for (let i = 0; i < config.topNaviLinks.length; i++) {
      links.push(<Tab
        key={`fpp-tab-${i}`}
        label={config.topNaviLinks[i].name} value={`t${i}`}
        style={{ ...tabStyle }}
        onActive={() => { window.location = config.topNaviLinks[i].href; }}
      />);
    }
  }
  return links;
})();

const AppBarLarge = ({ titleClicked }) =>
  <div>
    <div
      className="top-bar row" style={{ height: '60px',
      maxWidth: '100%',
      zIndex: '803',
      boxShadow: '2px 0px 2px #575757' }}
    >
      <div className="columns small-3" style={{ textAlign: 'left' }}>
        <img alt="LOGO" className="navi-logo" src={config.logo} onClick={titleClicked} />
      </div>
      <div className="columns small-5">
        <Tabs
          value="a"
          className="app-bar-tabs"
          inkBarStyle={{ height: 4, marginTop: -4 }}
        >
          <Tab label={config.title} value="a" style={{ ...tabStyle }} onActive={titleClicked} />
          {NAVI_LINKS}
        </Tabs>
      </div>
      <div className="columns small-4 hamburger-large">
        <MainMenuContainer />
      </div>
    </div>
    <NotImplemented />
    <DisruptionInfo />
    <MessageBar />
  </div>;

AppBarLarge.propTypes = {
  titleClicked: PropTypes.func.isRequired,
};

AppBarLarge.description = () => (
  <div>
    <p>
      AppBar of application for large display
    </p>
    <ComponentUsageExample description="">
      <AppBarLarge titleClicked={() => {}} />
    </ComponentUsageExample>
  </div>);

export default AppBarLarge;
