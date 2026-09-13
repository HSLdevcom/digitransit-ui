import PropTypes from 'prop-types';
import React from 'react';
import { useRouter } from 'found';
import { FormattedMessage } from 'react-intl';
import withBreakpoint from '../util/withBreakpoint.jsx';
import { useFavourites } from '../hooks/FavouriteContext.jsx';
import AppBar from './AppBar.jsx';
import AppBarHsl from './AppBarHsl.jsx';
import CrisisBannerHsl from './CrisisBannerHsl.jsx';
import MessageBar from './MessageBar.jsx';

const AppBarContainer = ({ homeUrl, logo, style, breakpoint, ...args }) => {
  const { match, router } = useRouter();
  const favourites = useFavourites();
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
          <CrisisBannerHsl />
          <AppBarHsl favourites={favourites} />
          <MessageBar breakpoint={breakpoint} />
        </div>
      ) : (
        <AppBar
          {...args}
          showLogo
          logo={logo}
          homeUrl={homeUrl}
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

AppBarContainer.propTypes = {
  homeUrl: PropTypes.string.isRequired,
  logo: PropTypes.string,
  style: PropTypes.string.isRequired,
  breakpoint: PropTypes.string.isRequired,
};

const AppBarContainerWithBreakpoint = withBreakpoint(AppBarContainer);

export default AppBarContainerWithBreakpoint;
