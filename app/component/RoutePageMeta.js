import { Helmet } from 'react-helmet';
import { intlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import compose from 'recompose/compose';
import getContext from 'recompose/getContext';
import mapProps from 'recompose/mapProps';
import { configShape } from '../util/shapes';

import { generateMetaData } from '../util/metaUtils';

const RoutePageMeta = compose(
  getContext({ config: configShape, intl: intlShape }),
  mapProps(({ config, intl, route }) => {
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
    return generateMetaData(
      {
        description,
        title,
      },
      config,
    );
  }),
)(Helmet);

export default createFragmentContainer(RoutePageMeta, {
  route: graphql`
    fragment RoutePageMeta_route on Route {
      shortName
      longName
    }
  `,
});
