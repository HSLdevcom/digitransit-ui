import React, { PropTypes } from 'react';
import { routerShape, locationShape } from 'react-router';
import ExternalLink from './ExternalLink';
import DisruptionInfo from './DisruptionInfo';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import LangSelect from './LangSelect';

const AppBarLarge = ({ titleClicked }, { router, location, config }) => {
  const openDisruptionInfo = () => {
    router.push({
      ...location,
      state: {
        ...location.state,
        disruptionInfoOpen: true,
      },
    });
  };
  return (
    <div>
      <div className="top-bar bp-large flex-horizontal">
        <a onClick={titleClicked} ><div className="navi-logo" /></a>
        <div className="empty-space flex-grow" />
        <div className="navi-languages right-border navi-margin"><LangSelect /></div>
        <div className="navi-icons navi-margin padding-horizontal-large">
          <a onClick={openDisruptionInfo}>
            <Icon img="icon-icon_caution" />
          </a>
        </div>
        <div className="padding-horizontal-large navi-margin" >
          <ExternalLink className="external-top-bar" {...config.appBarLink} />
        </div>
      </div>
      <DisruptionInfo />
    </div>
  );
};

AppBarLarge.propTypes = {
  titleClicked: PropTypes.func.isRequired,
};

AppBarLarge.displayName = 'AppBarLarge';

AppBarLarge.contextTypes = {
  router: routerShape.isRequired,
  location: locationShape.isRequired,
  config: PropTypes.object.isRequired,
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
