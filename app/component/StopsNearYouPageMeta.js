import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { intlShape } from 'react-intl';
import compose from 'recompose/compose';
import getContext from 'recompose/getContext';
import mapProps from 'recompose/mapProps';

import { generateMetaData } from '../util/metaUtils';

export default compose(
  getContext({ config: PropTypes.object, intl: intlShape }),
  mapProps(({ config, intl, match }) => {
    const { mode, place, origin } = match.params;
    const title = intl.formatMessage({
      id: 'stops-near-you.title',
      defaultMessage: 'Lähipysäkkien aikataulut',
    });
    const description = intl.formatMessage({
      id: 'stops-near-you.description',
      defaultMessage: 'Lähialueesi pysäkkiaikataulut ja ajoneuvot kartalla.',
    });
    return generateMetaData(
      {
        description,
        title,
      },
      config,
      {
        pathname: `/${encodeURIComponent(mode)}/${encodeURIComponent(
          place,
        )}/${encodeURIComponent(origin)}/`,
      },
    );
  }),
)(Helmet);
