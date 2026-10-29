import React from 'react';
import { useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import cx from 'classnames';
import { useRouter } from 'found';
import { fragmentRefShape } from '../../../utils/client/shapes';
import RouteStopListContainer from './RouteStopListContainer';
import { useBreakpoint } from '../../hooks/BreakpointContext';
import { routePagePath } from '../../../utils/shared/path';
import Error404 from '../404';
import ScrollableWrapper from '../ScrollableWrapper';
import { ExtendedRouteTypes } from '../../../utils/shared/constants';
import { useConfigContext } from '../../hooks/ConfigContext';
import PatternStopsContainerFragment from './queries/PatternStopsContainerFragment';

export default function PatternStopsContainer({
  pattern: patternRef = null,
  route: routeRef = null,
}) {
  const breakpoint = useBreakpoint();
  const intl = useIntl();
  const pattern = useFragment(
    PatternStopsContainerFragment.pattern,
    patternRef,
  );
  const route = useFragment(PatternStopsContainerFragment.route, routeRef);
  const config = useConfigContext();
  const { router } = useRouter();

  const routeId = route?.gtfsId;
  if (!pattern) {
    if (routeId) {
      router.replace(routePagePath(routeId));
    } else {
      return <Error404 />;
    }
    return null;
  }

  const { locale } = intl;
  const { constantOperationRoutes } = config;

  return (
    <ScrollableWrapper
      className={cx('route-page-content', {
        'bp-large': breakpoint === 'large',
      })}
    >
      {routeId && constantOperationRoutes[routeId] && (
        <div className="stop-constant-operation-container bottom-padding">
          <div style={{ width: '95%' }}>
            <span>{constantOperationRoutes[routeId][locale].text}</span>
            <span style={{ display: 'inline-block' }}>
              <a
                href={constantOperationRoutes[routeId][locale].link}
                target="_blank"
                rel="noreferrer"
              >
                {constantOperationRoutes[routeId][locale].link}
              </a>
            </span>
          </div>
        </div>
      )}
      {route?.type !== ExtendedRouteTypes.CallAgency && (
        <RouteStopListContainer
          key="list"
          pattern={pattern}
          patternId={pattern.code}
          hideDepartures={!!constantOperationRoutes[routeId]}
        />
      )}
    </ScrollableWrapper>
  );
}

PatternStopsContainer.propTypes = {
  pattern: fragmentRefShape,
  route: fragmentRefShape,
};
