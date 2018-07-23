import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import ExternalLink from './ExternalLink';
import DisruptionInfo from './DisruptionInfo';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import LangSelect from './LangSelect';
import MessageBar from './MessageBar';
import { isBrowser } from '../util/browser';

const AppBarLarge = (
  { titleClicked, logo },
  { router, location, config, intl },
) => {
  const openDisruptionInfo = () => {
    router.push({
      ...location,
      state: {
        ...location.state,
        disruptionInfoOpen: true,
      },
    });
  };

  let logoElement;

  if (config.textLogo) {
    logoElement = (
      <section className="title">
        <span className="title">{config.title}</span>
      </section>
    );
  } else if (isBrowser && logo) {
    logoElement = (
      <div className="navi-logo" style={{ backgroundImage: `url(${logo})` }} />
    );
  } else {
    logoElement = (
      <div className="navi-logo" style={{ backgroundImage: 'none' }} />
    );
  }

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */
  return (
    <div>
      <div className="top-bar bp-large flex-horizontal">
        <button className="noborder" onClick={titleClicked}>
          {logoElement}
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
      <MessageBar />
      <DisruptionInfo />
    </div>
  );
};

AppBarLarge.propTypes = {
  titleClicked: PropTypes.func.isRequired,
  logo: PropTypes.string,
};

AppBarLarge.displayName = 'AppBarLarge';

AppBarLarge.contextTypes = {
  router: routerShape.isRequired,
  location: locationShape.isRequired,
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

AppBarLarge.description = () => (
  <div>
    <p>AppBar of application for large display</p>
    <ComponentUsageExample description="">
      <AppBarLarge titleClicked={() => {}} />
    </ComponentUsageExample>
  </div>
);

export default AppBarLarge;
