import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { intlShape } from 'react-intl';
import Relay from 'react-relay/classic';
import compose from 'recompose/compose';
import getContext from 'recompose/getContext';
import mapProps from 'recompose/mapProps';

import { generateMetaData } from '../util/metaUtils';

const RoutePageMeta = compose(
  getContext({ config: PropTypes.object, intl: intlShape }),
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

export default Relay.createContainer(RoutePageMeta, {
  fragments: {
    route: () => Relay.QL`
      fragment on Route {
        shortName
        longName
      }
    `,
  },
});
