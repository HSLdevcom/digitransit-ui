import React from 'react';
import { Helmet } from 'react-helmet';
import { useFragment, graphql } from 'react-relay';
import { useIntl } from 'react-intl';
import { stationShape } from '../../../utils/client/shapes';
import { useConfigContext } from '../../client/ConfigContext';

import { generateMetaData } from '../../../utils/client/metaUtils';

function TerminalPageMeta({ station: stationRef }) {
  const config = useConfigContext();
  const station = useFragment(
    graphql`
      fragment TerminalPageMeta_station on Stop {
        name
        code
        desc
      }
    `,
    stationRef,
  );
  const intl = useIntl();
  if (!station) {
    return false;
  }

  const title = intl.formatMessage(
    {
      id: 'terminal-page.title',
      defaultMessage: 'Terminal - {name}',
    },
    station,
  );
  const description = intl.formatMessage(
    {
      id: 'terminal-page.description',
      defaultMessage: 'Terminal - {name} {code}, {desc}',
    },
    station,
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

TerminalPageMeta.propTypes = {
  station: stationShape.isRequired,
};

export default TerminalPageMeta;
