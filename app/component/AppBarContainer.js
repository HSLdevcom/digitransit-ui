import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import { FormattedMessage } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import withBreakpoint from '../util/withBreakpoint';
import { favouriteShape, userShape } from '../util/shapes';
import AppBar from './AppBar';
import AppBarHsl from './AppBarHsl';
import MessageBar from './MessageBar';

const AppBarContainer = (
  { homeUrl, logo, user, favourites, style, lang, breakpoint, ...args },
  { match, router },
) => {
  return (
    <>
      <a
        href="#mainContent"
        id="skip-to-content-link"
        style={{ display: 'block sr-only' }}
      >
        <FormattedMessage
          id="skip-to-content"
          defaultMessage="Skip to content"
        />
      </a>
      {style === 'hsl' ? (
        <div className="hsl-header-container" style={{ display: 'block' }}>
          <AppBarHsl user={user} lang={lang} favourites={favourites} />
          <MessageBar breakpoint={breakpoint} />
        </div>
      ) : (
        <AppBar
          {...args}
          showLogo
          logo={logo}
          homeUrl={homeUrl}
          user={user}
          breakpoint={breakpoint}
          titleClicked={() =>
            router.push({
              ...match.location,
              pathname: homeUrl,
              state: {
                ...match.location.state,
                errorBoundaryKey:
                  match.location.state && match.location.state.errorBoundaryKey
                    ? match.location.state.errorBoundaryKey + 1
                    : 1,
              },
            })
          }
        />
      )}
    </>
  );
};

AppBarContainer.contextTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
};

AppBarContainer.propTypes = {
  homeUrl: PropTypes.string.isRequired,
  logo: PropTypes.string,
  user: userShape,
  favourites: PropTypes.arrayOf(favouriteShape),
  style: PropTypes.string.isRequired,
  lang: PropTypes.string,
  breakpoint: PropTypes.string.isRequired,
};

AppBarContainer.defaultProps = {
  logo: undefined,
  user: undefined,
  favourites: [],
  lang: undefined,
};

const AppBarContainerWithBreakpoint = withBreakpoint(AppBarContainer);

const WithContext = connectToStores(
  AppBarContainerWithBreakpoint,
  ['FavouriteStore', 'UserStore', 'PreferencesStore'],
  context => ({
    user: context.getStore('UserStore').getUser(),
    lang: context.getStore('PreferencesStore').getLanguage(),
    favourites: context.getStore('FavouriteStore').getFavourites(),
  }),
);

WithContext.propTypes = {
  title: PropTypes.node,
};

export default WithContext;
