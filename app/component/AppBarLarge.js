import React, { PropTypes } from 'react';
import config from '../config';
import ExternalLink from './ExternalLink';
import DisruptionInfo from './DisruptionInfo';
import { open } from '../action/DisruptionInfoAction';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import LangSelect from './LangSelect';

const AppBarLarge = ({ titleClicked }, context) =>
  <div>
    <div className="top-bar bp-large flex-horizontal">
      <a onClick={titleClicked} ><div className="navi-logo" /></a>
      <div className="empty-space flex-grow" />
      <div className="navi-languages right-border navi-margin"><LangSelect /></div>
      <div className="navi-icons navi-margin padding-horizontal-large">
        <a onClick={() => context.executeAction(open)}>
          <Icon img="icon-icon_caution" />
        </a>
      </div>
      <div className="padding-horizontal-large navi-margin" >
        <ExternalLink {...config.appBarLink} />
      </div>
    </div>
    <DisruptionInfo />
  </div>;

AppBarLarge.propTypes = {
  titleClicked: PropTypes.func.isRequired,
};

AppBarLarge.contextTypes = {
  executeAction: React.PropTypes.func.isRequired,
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
