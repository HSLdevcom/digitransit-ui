import React from 'react';
import { Helmet } from 'react-helmet';
import { intlShape } from 'react-intl';
import { useFragment, graphql } from 'react-relay';
import { configShape, stationShape } from '../../util/shapes';

import { generateMetaData } from '../../util/metaUtils';

function TerminalPageMeta({ station: stationRef }, { config, intl }) {
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

TerminalPageMeta.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};

export default TerminalPageMeta;
