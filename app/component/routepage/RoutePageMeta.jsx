import React from 'react';
import { Helmet } from 'react-helmet';
import { useFragment, graphql } from 'react-relay';
import { useIntl } from 'react-intl';
import { routeShape } from '../../../utils/client/shapes';
import { generateMetaData } from '../../../utils/client/metaUtils';
import { useConfigContext } from '../../client/ConfigContext';

function RoutePageMeta({ route: routeRef }) {
  const config = useConfigContext();
  const route = useFragment(
    graphql`
      fragment RoutePageMeta_route on Route {
        shortName
        longName
      }
    `,
    routeRef,
  );
  const intl = useIntl();

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

export default RoutePageMeta;
