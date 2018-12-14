import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { intlShape } from 'react-intl';
import compose from 'recompose/compose';
import getContext from 'recompose/getContext';
import mapProps from 'recompose/mapProps';

import { otpToLocation } from '../util/otpStrings';
import { generateMetaData } from '../util/metaUtils';

export default compose(
  getContext({ config: PropTypes.object, intl: intlShape }),
  mapProps(({ config, intl, params: { from, to } }) => {
    const params = {
      from: otpToLocation(from).address,
      to: otpToLocation(to).address,
    };
    const title = intl.formatMessage(
      {
        id: 'summary-page.title',
        defaultMessage: 'Itinerary suggestions',
      },
      params,
    );
    const description = intl.formatMessage(
      {
        id: 'summary-page.description',
        defaultMessage: '{from} - {to}',
      },
      params,
    );
    return generateMetaData(
      {
        description,
        title,
      },
      config,
      {
        pathname: `/${encodeURIComponent(from)}/${encodeURIComponent(to)}`,
      },
    );
  }),
)(Helmet);
