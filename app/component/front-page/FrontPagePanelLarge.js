import React from 'react';
import Tabs from 'material-ui/Tabs/Tabs';
import Tab from 'material-ui/Tabs/Tab';
import FavouritesPanel from '../favourites/FavouritesPanel';
import NearbyRoutesPanel from './NearbyRoutesPanel';

const style = {
  background: '#eef1f3',
  padding: 0,
  width: '340px',
};

const tabStyle = { height: '100%' };

const FrontPagePanelLarge = ({ className }) => (
  <div style={style} className={className}>
    <Tabs
      inkBarStyle={{ height: 2, marginTop: -2 }}
      style={{ fontSize: '15px', height: '100%' }}
      className="content-marker"
    >
      <Tab label="nearby" value="1">
        <div style={tabStyle}>
          <NearbyRoutesPanel />
        </div>
      </Tab>
      <Tab label="favourites" value="2">
        <div style={tabStyle}>
          <FavouritesPanel />
        </div>
      </Tab>
    </Tabs>
  </div>
);

FrontPagePanelLarge.propTypes = {
  className: React.PropTypes.string,
};

export default FrontPagePanelLarge;
