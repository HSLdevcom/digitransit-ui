import { createFragmentContainer } from 'react-relay/compat';
import { graphql } from 'relay-runtime';
import Helmet from 'react-helmet';
import mapProps from 'recompose/mapProps';
import getContext from 'recompose/getContext';
import compose from 'recompose/compose';
import { intlShape } from 'react-intl';

const RoutePageMeta = compose(
  getContext({ intl: intlShape }),
  mapProps(({ intl, route }) => {
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
    return {
      title,
      meta: [
        {
          name: 'description',
          content: description,
        },
        {
          property: 'og:title',
          content: title,
        },
        {
          property: 'og:description',
          content: description,
        },
        {
          property: 'twitter:title',
          content: title,
        },
        {
          property: 'twitter:description',
          content: description,
        },
      ],
    };
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
