import Relay from 'react-relay';
import Helmet from 'react-helmet';
import mapProps from 'recompose/mapProps';
import getContext from 'recompose/getContext';
import compose from 'recompose/compose';
import { intlShape } from 'react-intl';

const StopPageMeta = compose(
  getContext({ intl: intlShape }),
  mapProps(props => ({
    title: props.intl.formatMessage({
      id: props.params.stopId ? 'stop-page.title' : 'terminal-page.title-short',
      defaultMessage:
        props.params.stopId ? 'Stop {stop_name} - {stop_code}' : 'Terminal {stop_name}',
    }, { stop_name: props.stop.name, stop_code: props.stop.code }),
    meta: [{
      name: 'description',
      content: props.intl.formatMessage({
        id: 'stop-page.description',
        defaultMessage: 'Stop {stop_name} - {stop_code}',
      }, { stop_name: props.stop.name, stop_code: props.stop.code }),
    }],
  }))
)(Helmet);

Relay.createContainer(StopPageMeta, {
  fragments: {
    stop: () => Relay.QL`
      fragment on Stop {
        name
        code
      }
    `,
  },
});
