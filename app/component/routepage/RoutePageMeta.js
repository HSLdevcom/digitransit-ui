import React from 'react';
import { Helmet } from 'react-helmet';
import { intlShape } from 'react-intl';
import { useFragment, graphql } from 'react-relay';
import { configShape, routeShape } from '../../util/shapes';
import { generateMetaData } from '../../util/metaUtils';

function RoutePageMeta({ route: routeRef }, { config, intl }) {
  const route = useFragment(
    graphql`
      fragment RoutePageMeta_route on Route {
        shortName
        longName
      }
    `,
    routeRef,
  );

  if (!route) {
    return false;
  }

  const title = intl.formatMessage(
    {
      id: 'route-page.title',
      defaultMessage: 'Route - {shortName}',
    },
    route,
  );
  const description = intl.formatMessage(
    {
      id: 'route-page.description',
      defaultMessage: 'Route - {shortName}, {longName}',
    },
    route,
  );
  const props = generateMetaData(
    {
      description,
      title,
    },
    config,
  );

  return <Helmet {...props} />;
}

RoutePageMeta.propTypes = {
  route: routeShape.isRequired,
};

RoutePageMeta.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};

export default RoutePageMeta;
