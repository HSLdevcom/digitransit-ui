import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import ExternalLink from './ExternalLink';
import DisruptionInfo from './DisruptionInfo';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import LangSelect from './LangSelect';

const AppBarLarge = ({ titleClicked }, { router, location, config, intl }) => {
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
        <button className="noborder" onClick={titleClicked}>
          {config.textLogo
            ? <section className="title">
                <span className="title">
                  {config.title}
                </span>
              </section>
            : <div className="navi-logo" />}
        </button>
        <div className="empty-space flex-grow" />
        <div className="navi-languages right-border navi-margin">
          <LangSelect />
        </div>
        <div className="navi-icons navi-margin padding-horizontal-large">
          <a
            className="noborder"
            onClick={openDisruptionInfo}
            aria-label={intl.formatMessage({
              id: 'disruptions',
              defaultMessage: 'Disruptions',
            })}
          >
            <Icon img="icon-icon_caution" />
          </a>
        </div>
        <div className="padding-horizontal-large navi-margin">
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
  intl: intlShape.isRequired,
};

AppBarLarge.description = () =>
  <div>
    <p>AppBar of application for large display</p>
    <ComponentUsageExample description="">
      <AppBarLarge titleClicked={() => {}} />
    </ComponentUsageExample>
  </div>;

export default AppBarLarge;
