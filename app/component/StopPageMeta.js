import Relay from 'react-relay';
import Helmet from 'react-helmet';
import mapProps from 'recompose/mapProps';
import getContext from 'recompose/getContext';
import compose from 'recompose/compose';
import { intlShape } from 'react-intl';

const StopPageMeta = compose(
  getContext({ intl: intlShape }),
  mapProps(({ intl, params, stop }) => {
    const title = intl.formatMessage({
      id: params.stopId ? 'stop-page.title' : 'terminal-page.title',
      defaultMessage:
        params.stopId ? 'Stop - {name} {code}' : 'Terminal - {name}',
    }, stop);
    const description = intl.formatMessage({
      id: params.stopId ? 'stop-page.description' : 'terminal-page.description',
      defaultMessage: params.stopId ? 'Stop - {name} {code}, {desc}' : 'Terminal - {name} {code}, {desc}',
    }, stop);
    return {
      title,
      meta: [{
        name: 'description',
        content: description,
      }, {
        property: 'og:title',
        content: title,
      }, {
        property: 'og:description',
        content: description,
      }, {
        property: 'twitter:title',
        content: title,
      }, {
        property: 'twitter:description',
        content: description,
      },
      ],
    };
  }),
)(Helmet);

export default Relay.createContainer(StopPageMeta, {
  fragments: {
    stop: () => Relay.QL`
      fragment on Stop {
        name
        code
        desc
      }
    `,
  },
});
