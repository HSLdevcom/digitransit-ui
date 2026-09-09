import PropTypes from 'prop-types';
import React from 'react';
import { useRouter } from 'found';
import { FormattedMessage } from 'react-intl';
import withBreakpoint from '../util/withBreakpoint';
import { useFavourites } from '../hooks/FavouriteContext';
import AppBar from './AppBar';
import AppBarHsl from './AppBarHsl';
import CrisisBannerHsl from './CrisisBannerHsl';
import MessageBar from './MessageBar';

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

AppBarContainerWithBreakpoint.propTypes = {
  title: PropTypes.node,
};

export default AppBarContainerWithBreakpoint;
