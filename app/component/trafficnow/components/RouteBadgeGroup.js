import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { useRouter } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Icon from '../../Icon';
import IconBackground from '../../icon/IconBackground';
import { favouriteShape } from '../../../util/shapes';

const STOP_SIGN_ICON_SCALE = 0.5;
const NORMAL_ICON_SCALE = 1;

const RouteBadgeGroup = ({
  mode,
  routes,
  isStop = false,
  highlightedGtfsId = undefined,
  renderRouteSuffix = null,
  renderSuffix = null,
  headsignGroupClassName = undefined,
  stopPropagation = false,
  favourites = [],
}) => {
  const { router } = useRouter();

  const favouriteRoutes = favourites
    .filter(({ type }) => type === 'route')
    .map(({ gtfsId }) => gtfsId);

  const handleRouteBadgeClick = url => e => {
    e.preventDefault();
    if (stopPropagation) {
      e.stopPropagation();
    }
    router.push(url);
  };

  return (
    <div className="badges__group">
      <Icon
        img={`icon_${mode}`}
        className={cx(mode, isStop ? 'stop' : 'route')}
        height={2}
        width={2}
        iconScale={isStop ? STOP_SIGN_ICON_SCALE : NORMAL_ICON_SCALE}
        background={
          isStop && <IconBackground shape="stopsign" color="currentcolor" />
        }
      />
      <div className={cx('badges__headsign-group', headsignGroupClassName)}>
        {routes.map(route => {
          const { name, url, gtfsId } = route;
          const routeKey = gtfsId || `${name}-${url}`;
          const isFavouriteRoute = favouriteRoutes.includes(gtfsId);
          const link = (
            <a
              onClick={handleRouteBadgeClick(url)}
              href={url}
              className={cx(mode, {
                highlight: gtfsId === highlightedGtfsId,
              })}
            >
              <span className="routes-m-narrow">{name}</span>
            </a>
          );
          const routeBadge = (
            <div className="badge-container">
              {link}
              {isFavouriteRoute && (
                <Icon img="icon_my-place" className="fav-icon" />
              )}
            </div>
          );

          if (!renderRouteSuffix) {
            return <React.Fragment key={routeKey}>{routeBadge}</React.Fragment>;
          }

          return (
            <div key={routeKey} className="badges__headsign-group--route">
              {routeBadge}
              {renderRouteSuffix(route)}
            </div>
          );
        })}
        {renderSuffix}
      </div>
    </div>
  );
};

RouteBadgeGroup.propTypes = {
  mode: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      gtfsId: PropTypes.string,
    }),
  ).isRequired,
  isStop: PropTypes.bool,
  highlightedGtfsId: PropTypes.string,
  renderRouteSuffix: PropTypes.func,
  renderSuffix: PropTypes.node,
  headsignGroupClassName: PropTypes.string,
  stopPropagation: PropTypes.bool,
  favourites: PropTypes.arrayOf(favouriteShape),
};

const connectedComponent = connectToStores(
  RouteBadgeGroup,
  ['FavouriteStore'],
  context => ({
    favourites: context.getStore('FavouriteStore').getFavourites(),
  }),
);

export { connectedComponent as default, RouteBadgeGroup as Component };
