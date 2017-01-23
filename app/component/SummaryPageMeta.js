import Helmet from 'react-helmet';
import mapProps from 'recompose/mapProps';
import getContext from 'recompose/getContext';
import compose from 'recompose/compose';
import { intlShape } from 'react-intl';
import { otpToLocation } from '../util/otpStrings';

export default compose(
  getContext({ intl: intlShape }),
  mapProps(({ intl, params: { from, to } }) => {
    const params = {
      from: otpToLocation(from).address,
      to: otpToLocation(to).address,
    };
    const title = intl.formatMessage({
      id: 'summary-page.title',
      defaultMessage: 'Itinerary suggestions',
    }, params);
    const description = intl.formatMessage({
      id: 'summary-page.description',
      defaultMessage: '{from} - {to}',
    }, params);
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
